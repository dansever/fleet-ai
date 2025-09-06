# app/ai/providers/openai_client_example.py
"""
Minimal examples for OpenAIClient:
- simple prompt
- messages
- structured output with schema
- streaming
- embeddings (single and batch)
"""

from typing import List
from pydantic import BaseModel
from app.ai.providers.openai_client import OpenAIClient
from app.shared.schemas.llm_schemas import LLMParams, LLMMessage, MessageRole


# Example schema for structured output
class UserProfile(BaseModel):
    name: str
    age: int
    interests: List[str]
    bio: str


async def main():
    client = OpenAIClient()

    # 1) Simple prompt
    r1 = client.generate(prompt="Give me one short programming joke.", temperature=0.7, max_output_tokens=80)
    print("Joke:", r1.content)

    # 2) Messages conversation
    msgs = [
        LLMMessage(role=MessageRole.SYSTEM, content="You are a concise coding tutor."),
        LLMMessage(role=MessageRole.USER, content="Explain binary search in Python with a tiny example."),
    ]
    r2 = client.generate(messages=msgs, temperature=0.3, max_output_tokens=180)
    print("\nBinary search:", r2.content)

    # 3) Structured output with a Pydantic schema
    r3 = client.generate(
        schema=UserProfile,
        prompt="Create a user profile for Dana, age 29, who enjoys AI, travel, and chess. Add a short bio.",
        temperature=0.6,
        max_output_tokens=200,
    )
    print("\nStructured profile JSON:", r3.content)

    # 4) Streaming
    print("\nStreaming Fibonacci function:")
    async for chunk in client.stream_generate(
        prompt="Write a tiny Python function that returns the nth Fibonacci number.",
        temperature=0.2,
        max_output_tokens=200,
    ):
        # Prints partial content as it streams
        print(chunk.content, end="", flush=True)
    print("\n")  # newline after stream

    # 5) Embeddings: single input
    vec = client.embed("Vectorize this short sentence.")
    print("Single embedding length:", len(vec[0]))

    # 6) Embeddings: batch input
    batch_vecs = client.embed(["alpha", "beta", "gamma"])
    print("Batch embeddings count:", len(batch_vecs))


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
