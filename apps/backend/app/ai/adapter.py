# app/ai/adapter.py
from typing import Protocol, Any
from typing import Type
from typing import AsyncIterator
from pydantic import BaseModel
from app.shared.schemas.llm_schemas import LLMParams
from app.shared.schemas.llm_schemas import LLMResponse


class LLMAdapter(Protocol):
    """
    Provider-agnostic interface for chat/completions models.
    Implemented by providers like OpenAIClient, GeminiClient, etc.
    """

    def generate(
        self, 
        schema: Type[BaseModel] | None = None, 
        params: LLMParams | None = None,
        **kwargs: Any,
    ) -> LLMResponse:
        ...

    def stream_generate(
        self, 
        schema: Type[BaseModel] | None = None, 
        params: LLMParams | None = None,
        **kwargs: Any,
    ) -> AsyncIterator[LLMResponse]:
        ...
