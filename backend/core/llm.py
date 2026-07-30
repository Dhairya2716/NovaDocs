import os

from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. Get one at https://console.groq.com/keys "
        "and add it to your .env file"
    )

client = Groq(api_key=GROQ_API_KEY)

# Groq deprecated its Llama chat models (llama-3.3-70b-versatile,
# llama-3.1-8b-instant) in 2026. openai/gpt-oss-120b is their current
# general-purpose recommendation; openai/gpt-oss-20b is a faster/lighter
# alternative if latency matters more than quality for your use case.
MODEL_NAME = "openai/gpt-oss-120b"

import logging as _logging
_log = _logging.getLogger(__name__)

def ask_llm(system_prompt: str, user_prompt: str, temperature: float = 0.3, max_tokens: int = 2048) -> str:
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )

    choice = response.choices[0]
    if choice.finish_reason == "length":
        _log.warning(
            "ask_llm: response was cut off (finish_reason='length'). "
            "Consider reducing input size or raising max_tokens."
        )
    return choice.message.content