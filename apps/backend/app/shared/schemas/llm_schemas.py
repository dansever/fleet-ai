from typing import Dict, Any, TypeVar, Optional
from pydantic import BaseModel, Field
from enum import Enum

# Generic type for structured responses
T = TypeVar("T", bound=BaseModel)

# -------- Model Provider --------
class ModelProvider(str, Enum):
    OPENAI = "openai"
    GEMINI = "gemini"
    LLAMA = "llama"

# -------- Message Role --------
class MessageRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"

# -------- Message --------
class LLMMessage(BaseModel):
    role: MessageRole
    content: str
    name: Optional[str] = None

# -------- Request --------
class LLMParams(BaseModel):
    """Normalized parameters for an LLM generation call"""
    # Input
    messages: list[LLMMessage] = Field(default_factory=list, description="Conversation history. If provided, this takes priority over `prompt` and `system`.")
    prompt: str | None = Field(None, description="Shortcut for a single user message. Used only if `messages` is empty.")
    system: str | None = Field(None, description="Optional system instruction. Used only if `messages` is empty.")
    # Model config
    model: str | None = Field(None, description="Model to use (defaults to active)")
    max_output_tokens: int | None = Field(None, ge=1, le=8192, description="Max tokens to generate")
    temperature: float = Field(None, ge=0.0, le=2.0, description="Controls randomness")
    top_p: float = Field(None, ge=0.0, le=1.0, description="Nucleus sampling parameter")
    stop: list[str] | None = Field(None, description="Stop sequences")
    # Structured output
    response_schema: type[BaseModel] | None = Field(None, description="Optional Pydantic schema for parsing")
    # Tools & extensions
    tools: Dict[str, Any] | None = Field(None, description="Tool/function definitions if supported")
    tool_choice: str | None = Field(None, description="Specific tool to force-select")
    # Runtime
    stream: bool = Field(False, description="Stream responses in chunks")


# ---------- Usage ----------
class Usage(BaseModel):
    input_tokens: int = Field(0, ge=0, description="Tokens in the prompt")
    output_tokens: int = Field(0, ge=0, description="Tokens in the response")
    total_tokens: int = Field(0, ge=0, description="Total tokens used")


# -------- Response --------
class LLMResponse(BaseModel):
    content: T | str = Field(..., description="Main response text from the LLM")
    usage: Usage = Field(..., description="Token usage metrics")
    model: str | None = Field(None, description="Model used for the response")

    def __str__(self):
        return (
            f"LLMResponse(usage={self.usage}, "
            f"content={self.content[:100]}{'...' if len(self.content) > 100 else ''})"
        )