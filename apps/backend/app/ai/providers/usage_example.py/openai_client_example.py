"""
Example usage of the OpenAIClient with various parameter combinations.
This demonstrates the flexibility and modularity of the new implementation.
"""

from typing import List
from pydantic import BaseModel
from app.ai.providers.openai_client import OpenAIClient
from app.shared.schemas.llm_schemas import (
    LLMParams, 
    LLMMessage, 
    MessageRole,
    LLMResponse
)

# Example schema for structured output
class UserProfile(BaseModel):
    name: str
    age: int
    interests: List[str]
    bio: str

async def example_usage():
    """Demonstrate various ways to use the OpenAIClient"""
    
    # Initialize client
    client = OpenAIClient()
    
    # Example 1: Simple text generation with prompt
    response1 = client.generate(
        prompt="Tell me a short joke about programming",
        temperature=0.8,
        max_output_tokens=100
    )
    print(f"Joke: {response1.content}")
    print(f"Tokens used: {response1.usage.total_tokens}")
    
    # Example 2: Using messages for conversation
    messages = [
        LLMMessage(role=MessageRole.SYSTEM, content="You are a helpful coding assistant."),
        LLMMessage(role=MessageRole.USER, content="How do I implement a binary search?")
    ]
    
    response2 = client.generate(
        messages=messages,
        temperature=0.3,
        max_output_tokens=200
    )
    print(f"Binary search explanation: {response2.content}")
    
    # Example 3: Structured output with schema
    response3 = client.generate(
        schema=UserProfile,
        prompt="Create a user profile for John, a 28-year-old software developer who loves Python and hiking",
        temperature=0.7
    )
    print(f"Structured profile: {response3.content}")
    
    # Example 4: Using LLMParams object
    params = LLMParams(
        prompt="Explain quantum computing in simple terms",
        temperature=0.5,
        max_output_tokens=150,
        top_p=0.9,
        stop=["\n\n", "In conclusion"]
    )
    
    response4 = client.generate(params=params)
    print(f"Quantum explanation: {response4.content}")
    
    # Example 5: Streaming with tools
    async for chunk in client.stream_generate(
        prompt="Write a Python function to calculate fibonacci numbers",
        temperature=0.2,
        max_output_tokens=300
    ):
        print(f"Streaming: {chunk.content}")
    
    # Example 6: Using tools (function calling)
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get weather information for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                    },
                    "required": ["location"]
                }
            }
        }
    ]
    
    response5 = client.generate(
        prompt="What's the weather like in New York?",
        tools=tools,
        tool_choice="auto"
    )
    print(f"Tool response: {response5.content}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())
