from typing import List, Dict

from core.json_llm import ask_llm_json

QUIZ_SYSTEM_PROMPT = (
    "You are a quiz generator for a study app. Given a summary of a document "
    "that covers its full content, generate multiple-choice questions spanning "
    "as many distinct topics from the summary as possible -- at least one "
    "question per major topic. Return ONLY a JSON array, no other text, where "
    "each item has exactly these keys: "
    '"question" (string), "options" (array of exactly 4 strings), '
    '"answer" (string, must exactly match one of the options), '
    '"topic" (short string naming the topic this question covers), '
    '"explanation" (string, briefly explaining why the answer is correct).'
)

def generate_quiz(document_summary: str, num_questions: int = 10) -> List[Dict]:
    """Generates quiz questions from the documents's full-coverage summary.

    Using the summary (rather than raw chunk text) is deliberate: the
    summarizer already condensed the ENTIRE document via map-reduce, so this
    input already spans every topic instead of just whatever fit in the
    first N characters -- the exact limitation the orignal app had.
    """

    user_prompt = (
        f"Generate {num_questions} multiple-choice questions covering this "
        f"document summary: \n\n{document_summary}"
    )

    result = ask_llm_json(QUIZ_SYSTEM_PROMPT, user_prompt)

    if not isinstance(result, list):
        raise ValueError("Expected a JSON array of questions from the LLM")
    
    return result