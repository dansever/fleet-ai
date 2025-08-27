from pydantic import BaseModel
from app.services.ai.openai_client import get_openai_client


# Example schema for structured output
class DualTone(BaseModel):
    formal: str
    casual: str


def run_examples():
    client = get_openai_client()

    # --- Example 1: Free text response ---
    res = client.generate(prompt="Summarize AI trends in 3 bullet points")
    print("=== Free Text Example ===")
    print("Content:", res.content)
    print("Model:", res.model)
    print("Usage:", res.usage.dict() if res.usage else None)
    print()

    # --- Example 2: Structured response ---
    res_structured = client.generate(
        prompt="Explain blockchain technology in both a formal and casual tone.",
        response_schema=DualTone,
        temperature=0.5,
    )
    print("=== Structured Example ===")
    print("Formal:", res_structured.content.formal)
    print("Casual:", res_structured.content.casual)
    print("Model:", res_structured.model)
    print("Usage:", res_structured.usage.dict() if res_structured.usage else None)


if __name__ == "__main__":
    run_examples()
