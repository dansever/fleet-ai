# app/ai/providers/openai_client.py
from __future__ import annotations
from typing import Iterable, Type, Dict, Any, List, Optional, AsyncIterator
from pydantic import BaseModel
from openai import OpenAI
from app.config import ai_config
from app.shared.schemas.llm_schemas import (
    LLMParams, 
    LLMResponse, 
    Usage, 
)

class OpenAIClient:
    """
    OpenAI wrapper that supports:
      - Chat completions (sync + streaming)
      - Embeddings (single or batched)
    Defaults are resolved from central ai_config (text + embedding models).
    """
    def __init__(
        self,
        api_key: str | None = None,
        default_text_model: str | None = None,
        default_embedding_model: str | None = None, 
        default_temperature: float | None = None,
        default_max_tokens: int | None = None,
        default_top_p: float | None = None,
    ):
        # API key
        self.api_key = api_key or ai_config.openai.api_key
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")
        
        # Model defaults from central config
        self.default_text_model = default_text_model or ai_config.active_text_model_id
        self.default_embedding_model = default_embedding_model or ai_config.active_embedding_model_id

        # Optional generation defaults
        self.default_temperature = default_temperature
        self.default_max_tokens = default_max_tokens
        self.default_top_p = default_top_p

        # Initialize OpenAI client
        self.client = OpenAI(api_key=self.api_key)

 # ------------------------ Embeddings ------------------------
    def embed(
        self,
        inputs: str | List[str],
        model: Optional[str] = None,
        encoding_format: Optional[str] = None,  # "float" or "base64"
        dimensions: Optional[int] = None,       # leave None for model default
    ) -> List[List[float]]:
        """
        Create embeddings for one or more inputs.
        Returns a list of vectors, one per input (order preserved).
        """
        model_id = model or self.default_embedding_model
        if not model_id:
            raise ValueError("No embedding model configured for OpenAI")

        resp = self.client.embeddings.create(
            model=model_id,
            input=inputs,
            **({"encoding_format": encoding_format} if encoding_format else {}),
            **({"dimensions": dimensions} if dimensions else {}),
        )
        return [item.embedding for item in resp.data]

    def embed_batch(
        self,
        inputs: Iterable[str],
        model: Optional[str] = None,
        batch_size: int = 512,
        encoding_format: Optional[str] = None,
        dimensions: Optional[int] = None,
    ) -> List[List[float]]:
        """
        Embed a large iterable of texts in batches.
        Note: simple size-based batching; adjust batch_size to your workload.
        """
        batch: List[str] = []
        out: List[List[float]] = []

        for text in inputs:
            batch.append(text)
            if len(batch) >= batch_size:
                out.extend(self.embed(batch, model=model, encoding_format=encoding_format, dimensions=dimensions))
                batch.clear()

        if batch:
            out.extend(self.embed(batch, model=model, encoding_format=encoding_format, dimensions=dimensions))

        return out

    # ------------------- Chat completions helpers -------------------

    def _prepare_messages(self, params: LLMParams) -> List[Dict[str, Any]]:
        """Convert LLMMessage objects to OpenAI chat format."""
        messages: List[Dict[str, Any]] = []

        # System
        if params.system:
            messages.append({"role": "system", "content": params.system})

        # Conversation messages
        for msg in (params.messages or []):
            message_dict: Dict[str, Any] = {"role": msg.role.value, "content": msg.content}
            if getattr(msg, "name", None):
                message_dict["name"] = msg.name
            messages.append(message_dict)

        # Single prompt fallback
        if params.prompt and not params.messages:
            messages.append({"role": "user", "content": params.prompt})

        return messages

    def _prepare_openai_params(self, params: LLMParams) -> Dict[str, Any]:
        """Convert LLMParams to OpenAI API parameters."""
        openai_params: Dict[str, Any] = {
            "model": params.model or self.default_text_model,
            "max_tokens": params.max_output_tokens or self.default_max_tokens,
            "stream": params.stream,
        }

        if params.temperature is not None or self.default_temperature is not None:
            openai_params["temperature"] = (
                params.temperature if params.temperature is not None else self.default_temperature
            )
        if params.top_p is not None or self.default_top_p is not None:
            openai_params["top_p"] = params.top_p if params.top_p is not None else self.default_top_p

        # Optional extras
        if params.stop:
            openai_params["stop"] = params.stop
        if params.tools:
            openai_params["tools"] = params.tools
        if params.tool_choice:
            openai_params["tool_choice"] = params.tool_choice

        # Drop None values
        return {k: v for k, v in openai_params.items() if v is not None}

    # ------------------------ Chat completions ------------------------

    def generate(
        self,
        schema: Optional[Type[BaseModel]] = None,
        params: Optional[LLMParams] = None,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate text using OpenAI Chat Completions, with optional Pydantic schema validation.
        If schema is provided, uses response_format={"type": "json_object"} and validates the JSON string.
        """
        # Build/merge params
        if params is None:
            params = LLMParams(**kwargs)
        else:
            for key, value in kwargs.items():
                if hasattr(params, key) and value is not None:
                    setattr(params, key, value)

        # Prepare request
        openai_params = self._prepare_openai_params(params)
        messages = self._prepare_messages(params)
        if not messages:
            raise ValueError("No messages or prompt provided")
        openai_params["messages"] = messages

        try:
            if schema:
                response = self.client.chat.completions.create(
                    **openai_params,
                    response_format={"type": "json_object"},
                )
                content = response.choices[0].message.content
                if not content:
                    raise ValueError("Empty response from OpenAI")
                # Validate only; keep raw content string in LLMResponse
                schema.model_validate_json(content)
            else:
                response = self.client.chat.completions.create(**openai_params)
                content = response.choices[0].message.content or ""

            usage = Usage(
                input_tokens=response.usage.prompt_tokens if response.usage else 0,
                output_tokens=response.usage.completion_tokens if response.usage else 0,
                total_tokens=response.usage.total_tokens if response.usage else 0,
            )

            return LLMResponse(
                content=content,
                usage=usage,
                model=response.model,
            )

        except Exception as e:
            raise RuntimeError(f"OpenAI API call failed: {str(e)}") from e

    async def stream_generate(
        self,
        schema: Optional[Type[BaseModel]] = None,
        params: Optional[LLMParams] = None,
        **kwargs,
    ) -> AsyncIterator[LLMResponse]:
        """
        Stream text generation using OpenAI Chat Completions.
        Note: token-level usage may be unavailable until the final chunk.
        """
        # Build/merge params
        if params is None:
            params = LLMParams(**kwargs)
        else:
            for key, value in kwargs.items():
                if hasattr(params, key) and value is not None:
                    setattr(params, key, value)

        # Ensure streaming
        params.stream = True

        # Prepare request
        openai_params = self._prepare_openai_params(params)
        messages = self._prepare_messages(params)
        if not messages:
            raise ValueError("No messages or prompt provided")
        openai_params["messages"] = messages

        try:
            stream = self.client.chat.completions.create(**openai_params)

            accumulated_content = ""
            last_chunk = None

            for chunk in stream:
                last_chunk = chunk

                # Append streamed delta content if present
                delta = getattr(chunk.choices[0], "delta", None)
                if delta and getattr(delta, "content", None):
                    accumulated_content += delta.content

                    # Per-chunk usage is often None in streaming
                    partial_usage = Usage(
                        input_tokens=getattr(chunk, "usage", None).prompt_tokens if getattr(chunk, "usage", None) else 0,
                        output_tokens=getattr(chunk, "usage", None).completion_tokens if getattr(chunk, "usage", None) else 0,
                        total_tokens=getattr(chunk, "usage", None).total_tokens if getattr(chunk, "usage", None) else 0,
                    )

                    yield LLMResponse(
                        content=accumulated_content,
                        usage=partial_usage,
                        model=getattr(chunk, "model", self.default_text_model),
                    )

            # Optional schema validation on the final accumulated content
            if schema and accumulated_content:
                try:
                    schema.model_validate_json(accumulated_content)
                except Exception:
                    # Keep raw content if it isn't valid JSON
                    pass

            final_usage = Usage(
                input_tokens=getattr(last_chunk, "usage", None).prompt_tokens if last_chunk and getattr(last_chunk, "usage", None) else 0,
                output_tokens=getattr(last_chunk, "usage", None).completion_tokens if last_chunk and getattr(last_chunk, "usage", None) else 0,
                total_tokens=getattr(last_chunk, "usage", None).total_tokens if last_chunk and getattr(last_chunk, "usage", None) else 0,
            )

            yield LLMResponse(
                content=accumulated_content,
                usage=final_usage,
                model=getattr(last_chunk, "model", self.default_text_model),
            )

        except Exception as e:
            raise RuntimeError(f"OpenAI streaming API call failed: {str(e)}") from e


def get_openai_client() -> OpenAIClient:
    """Convenience initializer that returns a ready-to-use OpenAI client."""
    return OpenAIClient()