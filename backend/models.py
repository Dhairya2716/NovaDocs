import uuid
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, JSON, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base

# all-MiniLM-L6-v2 produces 384-dim embeddings. If you swap embedding models
# later, this constant AND every existing row's embedding column must change.
EMBEDDING_DIM = 384


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)  # "user" | "admin"

    documents = relationship("Document", back_populates="uploader")


class Document(Base):
    __tablename__ = "documents"

    doc_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)  # key inside the Supabase Storage bucket
    is_global = Column(Boolean, default=False)  # admin uploads are visible to everyone
    status = Column(String, default="uploaded")  # uploaded -> processing -> completed -> failed
    summary = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploader = relationship("User", back_populates="documents")

    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    quiz_questions = relationship("QuizQuestion", back_populates="document", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True)
    doc_id = Column(UUID(as_uuid=True), ForeignKey("documents.doc_id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=False)

    document = relationship("Document", back_populates="chunks")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True)
    doc_id = Column(UUID(as_uuid=True), ForeignKey("documents.doc_id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    answer = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)

    document = relationship("Document", back_populates="quiz_questions")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True)
    doc_id = Column(UUID(as_uuid=True), ForeignKey("documents.doc_id"), nullable=False, index=True)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    topic = Column(String, nullable=True)

    document = relationship("Document", back_populates="flashcards")