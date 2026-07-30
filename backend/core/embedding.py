# from sys import maxsize
from functools import lru_cache
from typing import List

from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2" # 384-dim, ~80MB, CPU-friendly -- matches EMBEDDING_DIM in models.py

@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    # Loaded on first real use (not at import time) and cached per-process
    # so app startup stays fast and the model is only loaded once.
    return SentenceTransformer(MODEL_NAME)

def embed_texts(texts: List[str]) -> List[List[float]]:
    model = _get_model()
    vectors = model.encode(texts, batch_size=16, show_progress_bar=False, normalize_embeddings=True)
    return vectors.tolist()

def embed_query(text: str) -> List[float]:
    return embed_texts([text])[0]