import json
from typing import Union

from groq import Groq
from core.llm import GROQ_API_KEY, MODEL_NAME

client = Groq(api_key=GROQ_API_KEY)

def ask_llm_json(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> Union[dict, list]:
    """Same as ask_llm, but asks the model to return JSON and parse it.

    Strips markdown code fences defensively -- modules sometime wrap JSON in
    ```json ... ``` even when told not to.
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content":system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:]
            raw = raw.strip()
    
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"LLM did not reutrn valid JSON: {exc}\n Raw Output (truncated): {raw[:500]}"
        ) from exc