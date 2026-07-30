import os
from datetime import timedelta

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, Base, get_db
from models import User, Document, QuizQuestion, Flashcard
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    require_document_access,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from storage import upload_pdf
from core.pipeline import process_document
from core.retrieval import retrieve_relevant_chunks
from core.llm import ask_llm
from core.quiz import generate_quiz
from core.flashcards import generate_flashcards

# Dev convenience only. Once the schema stabilizes, switch to Alembic
# migrations so schema changes don't require dropping tables.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PDF Study Platform API")

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
# Always include common local dev ports so a stale .env never blocks login
_CORS_ORIGINS = list({FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:3000"})
app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


class UserCreate(BaseModel):
    username: str
    password: str


@app.get("/")
def read_root():
    return {"status": "API online"}


@app.post("/api/auth/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    is_first_user = db.query(User).count() == 0
    role = "admin" if is_first_user else "user"

    new_user = User(
        username=user.username,
        password_hash=get_password_hash(user.password),
        role=role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "role": role}


@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}


@app.post("/api/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 20MB).")

    doc_id, storage_path = upload_pdf(content, file.filename)

    new_doc = Document(
        doc_id=doc_id,
        filename=file.filename,
        storage_path=storage_path,
        is_global=(current_user.role == "admin"),
        uploader_id=current_user.id,
        status="uploaded",
    )
    db.add(new_doc)
    db.commit()

    background_tasks.add_task(process_document, doc_id)
    return {"document_id": doc_id, "message": "Uploaded. Processing started in the background."}


@app.get("/api/documents")
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(
        (Document.is_global == True) | (Document.uploader_id == current_user.id)  # noqa: E712
    ).all()
    return [
        {
            "doc_id": str(d.doc_id),
            "filename": d.filename,
            "status": d.status,
            "is_global": d.is_global,
            "uploaded_by_me": d.uploader_id == current_user.id,
        }
        for d in docs
    ]


@app.get("/api/documents/{document_id}")
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.doc_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    require_document_access(doc, current_user)  # <- the check that was missing before

    return {
        "doc_id": str(doc.doc_id),
        "filename": doc.filename,
        "status": doc.status,
        "summary": doc.summary,
        "error": doc.error,
    }


class ChatRequest(BaseModel):
    document_id: str
    question: str


@app.post("/api/chat")
def chat_with_document(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.doc_id == request.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    require_document_access(doc, current_user)  # <- this is the check the original app was missing

    if doc.status != "completed":
        raise HTTPException(
            status_code=409,
            detail=f"Document isn't ready yet (status: {doc.status}).",
        )

    contents, similarities, indices = retrieve_relevant_chunks(db, doc.doc_id, request.question)
    if not contents:
        raise HTTPException(status_code=404, detail="No indexed content found for this document.")

    context = "\n\n---\n\n".join(contents)
    system_prompt = (
        "You are a study assistant. Answer the user's question using ONLY the "
        "provided document excerpts. If the answer isn't contained in the "
        "excerpts, say you don't have enough information rather than guessing."
    )
    user_prompt = f"Document excerpts:\n{context}\n\nQuestion: {request.question}"

    answer = ask_llm(system_prompt, user_prompt)

    # Confidence = mean cosine similarity of retrieved chunks (0–1).
    # High (>0.7): question matches document well.
    # Low (<0.4): question may be outside document scope.
    confidence = round(sum(similarities) / len(similarities), 3) if similarities else 0.0

    sources = [
        {"chunk_index": idx, "content": c, "similarity": s}
        for idx, c, s in zip(indices, contents, similarities)
    ]

    return {"answer": answer, "confidence": confidence, "sources": sources}


@app.post("/api/documents/{document_id}/quiz/generate")
def generate_quiz_endpoint(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.doc_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    require_document_access(doc, current_user)

    if doc.status != "completed":
        raise HTTPException(status_code=409, detail=f"Document isn't ready yet (status: {doc.status}).")
    if not doc.summary:
        raise HTTPException(status_code=409, detail="Document has no summary yet; cannot generate a quiz.")

    questions_data = generate_quiz(doc.summary)

    # Replace any previous quiz for this document rather than appending to it.
    db.query(QuizQuestion).filter(QuizQuestion.doc_id == doc.doc_id).delete()

    new_questions = []
    for q in questions_data:
        question = QuizQuestion(
            doc_id=doc.doc_id,
            question=q["question"],
            options=q["options"],
            answer=q["answer"],
            topic=q.get("topic", "General"),
            explanation=q.get("explanation"),
        )
        db.add(question)
        new_questions.append(question)
    db.commit()

    # Answer and explanation are withheld here on purpose -- they're only
    # revealed per-question via /api/evaluate, after the user submits.
    return [
        {"id": q.id, "question": q.question, "options": q.options, "topic": q.topic}
        for q in new_questions
    ]


@app.get("/api/documents/{document_id}/quiz")
def get_quiz(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.doc_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    require_document_access(doc, current_user)

    questions = db.query(QuizQuestion).filter(QuizQuestion.doc_id == doc.doc_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No quiz generated yet for this document.")

    return [
        {"id": q.id, "question": q.question, "options": q.options, "topic": q.topic}
        for q in questions
    ]


class EvaluateRequest(BaseModel):
    document_id: str
    answers: dict  # {question_id (as string): selected_option}


@app.post("/api/evaluate")
def evaluate_quiz(
    request: EvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.doc_id == request.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    require_document_access(doc, current_user)  # <- also missing on this route in the original app

    questions = db.query(QuizQuestion).filter(QuizQuestion.doc_id == doc.doc_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No quiz found for this document.")

    results = []
    correct_count = 0
    topic_stats: dict = {}

    for q in questions:
        selected = request.answers.get(str(q.id))
        is_correct = selected == q.answer
        if is_correct:
            correct_count += 1

        stats = topic_stats.setdefault(q.topic, {"correct": 0, "total": 0})
        stats["total"] += 1
        if is_correct:
            stats["correct"] += 1

        results.append(
            {
                "question_id": q.id,
                "question": q.question,
                "selected": selected,
                "correct_answer": q.answer,
                "is_correct": is_correct,
                "explanation": q.explanation,
                "topic": q.topic,
            }
        )

    return {
        "score": correct_count,
        "total": len(questions),
        "topic_breakdown": topic_stats,
        "results": results,
    }


@app.post("/api/documents/{document_id}/flashcards/generate")
def generate_flashcards_endpoint(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.doc_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    require_document_access(doc, current_user)

    if doc.status != "completed":
        raise HTTPException(status_code=409, detail=f"Document isn't ready yet (status: {doc.status}).")
    if not doc.summary:
        raise HTTPException(status_code=409, detail="Document has no summary yet; cannot generate flashcards.")

    cards_data = generate_flashcards(doc.summary)

    db.query(Flashcard).filter(Flashcard.doc_id == doc.doc_id).delete()

    new_cards = []
    for c in cards_data:
        card = Flashcard(doc_id=doc.doc_id, front=c["front"], back=c["back"], topic=c.get("topic"))
        db.add(card)
        new_cards.append(card)
    db.commit()

    return [{"id": c.id, "front": c.front, "back": c.back, "topic": c.topic} for c in new_cards]


@app.get("/api/documents/{document_id}/flashcards")
def get_flashcards(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.doc_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    require_document_access(doc, current_user)

    cards = db.query(Flashcard).filter(Flashcard.doc_id == doc.doc_id).all()
    if not cards:
        raise HTTPException(status_code=404, detail="No flashcards generated yet for this document.")

    return [{"id": c.id, "front": c.front, "back": c.back, "topic": c.topic} for c in cards]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)