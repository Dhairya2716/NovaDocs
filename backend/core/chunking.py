from functools import lru_cache
from typing import List

from transformers import AutoTokenizer

from core.embedding import MODEL_NAME

# all-MiniLM-L6-v2's hard limit is 256 tokens. MAX_TOKENS stays confortably
# under that (leaving room for speacial tokens) so nothing ets silently
# truncated at encode time -- the bug the old character-based version risked.
MAX_TOKEN = 240
OVERLAP_TOKEN = 40

@lru_cache(maxsize=1)
def _get_tokenizer():
    # same tokenizer the embedding model itself uses, loaded once and cached.
    # Using a generaic tokenizer (e.g. tiktoken) here would count tokens
    # differently then MiniLM does and wouldn't actually prevent truncation.
    return AutoTokenizer.from_pretrained(f"sentence-transformers/{MODEL_NAME}")

def chunk_text(text: str, max_tokens: int = MAX_TOKEN, overlap_tokens: int = OVERLAP_TOKEN) -> List[str]:
    """Splits text into overlapping chunks by token count,
    so each chunk fits the embedding model's real limit exactly
    """

    if overlap_tokens >= max_tokens:
        raise ValueError("overlap_tokens must be smaller than max_tokens")
    
    tokenizer = _get_tokenizer()
    token_ids = tokenizer.encode(text, add_special_tokens=False)

    chunks = []
    start = 0
    while start < len(token_ids):
        end = start + max_tokens
        chunk_ids = token_ids[start:end]
        chunk = tokenizer.decode(chunk_ids, skip_special_tokens=True).strip()
        if chunk:
            chunks.append(chunk)
        start += max_tokens - overlap_tokens
    
    return chunks