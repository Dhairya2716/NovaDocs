from typing import List

from core.llm import ask_llm

# How many chunks (or partial summaries) get combined per call.
# 10 × ~180 words ≈ 1 800 words — well within any model's context limit.
CHUNK_GROUP_SIZE = 10

MAP_SYSTEM_PROMPT = (
    "You summarize a section of a study document into a concise paragraph, "
    "preserving key facts, terms, and structure. Do not add outside information "
    "or invent anything not present in the text."
)

REDUCE_SYSTEM_PROMPT = (
    "You combine several partial summaries of sections of the same document "
    "into one coherent overall summary, organized by topic. Remove repetition "
    "between sections but keep every distinct topic that was covered. "
    "Write complete sentences — do not stop mid-sentence."
)


def _group_chunks(items: List[str], group_size: int) -> List[str]:
    return [
        "\n\n".join(items[i : i + group_size])
        for i in range(0, len(items), group_size)
    ]


def summarize_document(chunk_contents: List[str]) -> str:
    """Produces one summary covering the whole document, regardless of length.

    Uses a recursive tree-reduce instead of a single flat reduce:
    each LLM call receives at most CHUNK_GROUP_SIZE items so the input
    is always bounded, even for 500-chunk documents.

    Map:    every group of chunks  → partial summary
    Reduce: every group of summaries → combined summary  (repeated until 1 left)
    """

    if not chunk_contents:
        return ""

    # ── Map phase ────────────────────────────────────────────────────────────
    groups = _group_chunks(chunk_contents, CHUNK_GROUP_SIZE)
    summaries = [
        ask_llm(MAP_SYSTEM_PROMPT, group_text, max_tokens=512)
        for group_text in groups
    ]

    # ── Recursive reduce phase ────────────────────────────────────────────────
    # Each round halves the number of summaries (÷ CHUNK_GROUP_SIZE).
    # Guaranteed to terminate: O(log_k(n)) rounds where k = CHUNK_GROUP_SIZE.
    while len(summaries) > 1:
        reduced = []
        for i in range(0, len(summaries), CHUNK_GROUP_SIZE):
            batch = summaries[i : i + CHUNK_GROUP_SIZE]
            if len(batch) == 1:
                reduced.append(batch[0])      # nothing to merge, pass through
            else:
                combined = "\n\n---\n\n".join(batch)
                reduced.append(ask_llm(REDUCE_SYSTEM_PROMPT, combined, max_tokens=1024))
        summaries = reduced

    return summaries[0]