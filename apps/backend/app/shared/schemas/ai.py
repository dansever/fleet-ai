from typing import Dict, Any, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T", bound=BaseModel)

# -------- Request --------
class LLMRequest(BaseModel):
    prompt: str = Field(..., description="The prompt to send to the LLM", min_length=1)
    system: str | None = Field(None, description="System instructions, if supported")
    model: str | None = Field(None, description="The model to use (defaults to active model)")
    max_output_tokens: int = Field(1000, ge=1, le=8192, description="Maximum tokens to generate")
    temperature: float = Field(0.0, ge=0.0, le=2.0, description="Controls randomness (0.0 to 2.0)")
    top_p: float = Field(1.0, ge=0.0, le=1.0, description="Nucleus sampling parameter")
    stop_sequences: list[str] | None = Field(None, description="Stop sequences")
    json_schema: Dict[str, Any] | None = Field(None, description="Hard schema for structured output (if supported)")
    tool_choice: str | None = Field(None, description="Specific tool/function to call when using tool-use")
    metadata: Dict[str, Any] | None = Field(None, description="Arbitrary request metadata")

# ---------- Usage ----------
class AIModelUsage(BaseModel):
    input_tokens: int = Field(0, ge=0, description="Tokens in the prompt")
    output_tokens: int = Field(0, ge=0, description="Tokens in the response")
    total_tokens: int = Field(0, ge=0, description="Total tokens used")

# -------- Response --------
class LLMResponse(BaseModel):
    content: str = Field(..., description="Main response text from the LLM")
    parsed: T | None = Field(None, description="Structured parsed output (if applicable)")
    usage: AIModelUsage = Field(..., description="Token usage statistics")
    success: bool = Field(True, description="Whether the LLM call was successful")
    error: str | None = Field(None, description="Error message if the call failed")

    def __str__(self):
        return (
            f"LLMResponse(usage={self.usage}, "
            f"content={self.content[:100]}{'...' if len(self.content) > 100 else ''})"
        )