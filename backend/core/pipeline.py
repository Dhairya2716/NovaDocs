from database import SessionLocal
from models import Document, Chunk
from storage import download_pdf
from core.extraction import extract_text
from core.chunking import chunk_text
from core.embedding import embed_texts
from core.summarizer import summarize_document


def process_document(doc_id: str) -> None:
    """Runs in the background after upload: extract -> chunk -> embed -> store.

    Opens its own DB session since background tasks run outside the
    request/response cycle where FastAPI's get_db() dependency applies.
    """
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.doc_id == doc_id).first()
        if not doc:
            return

        doc.status = "processing"
        db.commit()

        pdf_bytes = download_pdf(doc.storage_path)
        text = extract_text(pdf_bytes)

        if not text.strip():
            doc.status = "failed"
            doc.error = "No extractable text found (the PDF may be a scanned image)."
            db.commit()
            return

        chunks = chunk_text(text)
        embeddings = embed_texts(chunks)

        for index, (content, vector) in enumerate(zip(chunks, embeddings)):
            db.add(Chunk(doc_id=doc.doc_id, chunk_index=index, content=content, embedding=vector))

        # Map-reduce over every chunk, not just the first N characters --
        # this also feeds quiz/flashcard generation later, so both get full
        # document coverage instead of only summarizing the opening section
        doc.summary = summarize_document(chunks)

        doc.status = "completed"
        db.commit()
    except Exception as exc:
        db.rollback()
        doc = db.query(Document).filter(Document.doc_id == doc_id).first()
        if doc:
            doc.status = "failed"
            doc.error = str(exc)
            db.commit()
    finally:
        db.close()