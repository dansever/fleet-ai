from typing import Any, Dict, List, Optional, Protocol, Type, TypeVar, Union
from pydantic import BaseModel
from enum import Enum

# Generic type for structured responses
T = TypeVar("T", bound=BaseModel)


class ModelProvider(str, Enum):
    OPENAI = "openai"
    GEMINI = "gemini"
    LLAMA = "llama"


class MessageRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class Message(BaseModel):
    role: MessageRole
    content: str
    name: Optional[str] = None


class GenerateParams(BaseModel):
    """Unified parameters for text generation"""
    model: str
    messages: List[Message]
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = None
    max_tokens: Optional[int] = None
    stream: bool = False


class Usage(BaseModel):
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None


class LLMResult(BaseModel):
    """Standardized LLM response wrapper"""
    content: str | BaseModel
    usage: Usage | None = None
    model: str | None = None


class LLMAdapter(Protocol):
    """Adapter interface for different providers"""
    def generate(self, schema: Optional[Type[T]], params: GenerateParams) -> LLMResult:
        ...

    def stream_generate(self, schema: Optional[Type[T]], params: GenerateParams):
        ...
