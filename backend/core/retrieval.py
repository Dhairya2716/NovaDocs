from typing import List, Tuple

from sqlalchemy.orm import Session

from models import Chunk
from core.embedding import embed_query


def retrieve_relevant_chunks(
    db: Session,
    doc_id: str,
    query: str,
    top_k: int = 5,
) -> Tuple[List[str], List[float], List[int]]:
    """Returns the top_k most relevant chunks for a query.

    Returns a tuple of three parallel lists:
      - contents:     chunk text strings (in document order)
      - similarities: cosine similarity score per chunk (0–1, higher = more relevant)
      - indices:      chunk_index values (document position)

    Re-sorting into document order (not similarity order) means the LLM
    reads the material the way it flows in the source, while similarity
    scores are preserved so callers can compute confidence.
    """

    query_vector = embed_query(query)

    # pgvector's cosine_distance returns values in [0, 2].
    # cosine_similarity = 1 - cosine_distance  (for normalised vectors: range [−1, 1])
    # Since our embeddings are L2-normalised the practical range is [0, 1].
    results = (
        db.query(
            Chunk,
            Chunk.embedding.cosine_distance(query_vector).label("distance"),
        )
        .filter(Chunk.doc_id == doc_id)
        .order_by(Chunk.embedding.cosine_distance(query_vector))
        .limit(top_k)
        .all()
    )

    # Re-sort into document order
    results_in_order = sorted(results, key=lambda row: row[0].chunk_index)

    contents = [row[0].content for row in results_in_order]
    similarities = [round(max(0.0, 1.0 - float(row[1])), 3) for row in results_in_order]
    indices = [row[0].chunk_index for row in results_in_order]

    return contents, similarities, indices