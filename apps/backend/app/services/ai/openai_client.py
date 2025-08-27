from __future__ import annotations
from typing import Type, Dict, Any, List
from pydantic import BaseModel
from openai import OpenAI

from app.config import AIConfig
from app.services.ai import Usage, LLMResult
from app.services.ai.base import Message, MessageRole


class OpenAIClient:
    def __init__(
        self,
        api_key: str | None = None,
        default_model: str | None = None,
        default_temperature: float = 0.7,
        default_reasoning: Dict[str, Any] | None = None,
    ):
        config = AIConfig()

        self.api_key = api_key or config.openai.api_key
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")

        self.default_model = default_model or config.active_model_id
        self.default_temperature = default_temperature
        self.default_reasoning = default_reasoning or {}

        self.client = OpenAI(api_key=self.api_key)

    def generate(
        self,
        *,
        prompt: str | None = None,
        messages: List[Dict[str, str]] | None = None,
        response_schema: Type[BaseModel] | None = None,
        model: str | None = None,
        temperature: float | None = None,
        reasoning: Dict[str, Any] | None = None,
        system_message: str | None = None,
        **kwargs,
    ) -> LLMResult:
        """
        Flexible generate method for both free-form text and structured output.
        Always returns LLMResult with content + meta.
        """

        # Defaults
        model = model or self.default_model
        temperature = temperature if temperature is not None else self.default_temperature
        reasoning = {**self.default_reasoning, **(reasoning or {})}

        # Wrap prompt/system_message into messages if needed
        if not messages:
            messages = []
            if system_message:
                messages.append(Message(role=MessageRole.SYSTEM, content=system_message))
            if prompt:
                messages.append(Message(role=MessageRole.USER, content=prompt))

        params = {
            "model": model,
            "temperature": temperature,
            "input": messages,
            **reasoning,
            **kwargs,
        }

        if response_schema:
            response = self.client.responses.parse(
                **params,
                text_format=response_schema,
            )
            content = response.output_parsed
        else:
            response = self.client.responses.create(**params)
            content = response.output_text

        usage = Usage(
            input_tokens=getattr(response.usage, "input_tokens", None),
            output_tokens=getattr(response.usage, "output_tokens", None),
            total_tokens=getattr(response.usage, "total_tokens", None),
        )

        return LLMResult(
            content=content,
            usage=usage,
            model=getattr(response, "model", model),
        )


def get_openai_client() -> OpenAIClient:
    """Convenience initializer that always returns a ready-to-use OpenAI client"""
    return OpenAIClient()