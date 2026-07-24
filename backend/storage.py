import os
import uuid
from typing import Tuple

from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
BUCKET_NAME = os.environ.get("SUPABASE_BUCKET", "documents")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. Find both under "
        "Supabase -> Project Settings -> API (use the service_role key, not anon, "
        "since the backend needs write access to a private bucket)."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def upload_pdf(file_bytes: bytes, original_filename: str) -> Tuple[str, str]:
    """Uploads a PDF to Supabase Storage. Returns (doc_id, storage_path).

    doc_id is generated here (not left to the caller) so the storage path and
    the database primary key are always derived from the same value.
    """
    doc_id = str(uuid.uuid4())
    storage_path = f"{doc_id}.pdf"
    supabase.storage.from_(BUCKET_NAME).upload(
        storage_path,
        file_bytes,
        {"content-type": "application/pdf"},
    )
    return doc_id, storage_path


def download_pdf(storage_path: str) -> bytes:
    """Downloads a PDF's raw bytes from Supabase Storage for processing."""
    return supabase.storage.from_(BUCKET_NAME).download(storage_path)


def delete_pdf(storage_path: str) -> None:
    supabase.storage.from_(BUCKET_NAME).remove([storage_path])