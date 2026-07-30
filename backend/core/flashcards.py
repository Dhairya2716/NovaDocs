from typing import Dict, List

from core.json_llm import ask_llm_json

FLASHCARD_SYSTEM_PROMPT = (
    "You are a flashcard generator for a study app. Given a summary of a "
    "document that covers its full content, generate flashcards spanning as "
    "many distinct topics from the summary as possible. Return ONLY a JSON "
    "array, no other text, where each item has exactly these keys: "
    '"front" (a question or term, string), "back" (the answer or definition, '
    'string), "topic" (short string).'
)

def generate_flashcards(document_summary: str, num_cards: int = 15) -> List[Dict]:
    user_prompt = (
        f"Generate {num_cards} flashcards covering this document summary:\n\n{document_summary}"
    )

    result = ask_llm_json(FLASHCARD_SYSTEM_PROMPT, user_prompt)
    if not isinstance(result, list):
        raise ValueError("Expected a JSON array of flashcards from the LLM")
    
    return result