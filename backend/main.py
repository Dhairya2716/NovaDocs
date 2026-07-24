import os
from datetime import timedelta

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, Base, get_db
from models import User, Document
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    require_document_access,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from storage import upload_pdf

# Dev convenience only. Once the schema stabilizes, switch to Alembic
# migrations so schema changes don't require dropping tables.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PDF Study Platform API")

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
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

    # Day 2 wires this up: background_tasks.add_task(process_pdf_logic, doc_id)
    # to extract text, chunk it, embed it, and store vectors in pgvector.
    return {"document_id": doc_id, "message": "Uploaded. Processing pipeline lands on Day 2."}


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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)