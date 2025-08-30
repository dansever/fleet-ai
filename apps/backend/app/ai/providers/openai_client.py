# app/ai/providers/openai_client.py
from __future__ import annotations
from typing import Type, Dict, Any, List, Optional, AsyncIterator
from pydantic import BaseModel
from openai import OpenAI
from app.config import ai_config
from app.shared.schemas.llm_schemas import (
    LLMParams, 
    LLMResponse, 
    Usage, 
)


class OpenAIClient:
    def __init__(
        self,
        api_key: str | None = None,
        default_model: str | None = None,
        default_temperature: float | None = None,
        default_max_tokens: int | None = None,
        default_top_p: float | None = None,
    ):

        self.api_key = api_key or ai_config.openai.api_key
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")
        self.default_model = default_model or ai_config.active_model_id
        self.default_temperature = default_temperature
        self.default_max_tokens = default_max_tokens
        self.default_top_p = default_top_p
        self.client = OpenAI(api_key=self.api_key)

    def _prepare_messages(self, params: LLMParams) -> List[Dict[str, Any]]:
        """Convert LLMMessage objects to OpenAI format"""
        messages = []
        
        # Handle system message if provided
        if params.system:
            messages.append({"role": "system", "content": params.system})
        
        # Add conversation messages
        for msg in (params.messages or []):
            message_dict = {"role": msg.role.value, "content": msg.content}
            if msg.name:
                message_dict["name"] = msg.name
            messages.append(message_dict)
        
        # Handle single prompt if no messages
        if params.prompt and not params.messages:
            messages.append({"role": "user", "content": params.prompt})
            
        return messages

    def _prepare_openai_params(self, params: LLMParams) -> Dict[str, Any]:
        """Convert LLMParams to OpenAI API parameters"""
     
        openai_params = {
        "model": params.model or self.default_model,
        "max_tokens": params.max_output_tokens or self.default_max_tokens,
        "stream": params.stream,
        }
        if params.temperature is not None or self.default_temperature is not None:
            openai_params["temperature"] = params.temperature if params.temperature is not None else self.default_temperature
        if params.top_p is not None or self.default_top_p is not None:
            openai_params["top_p"] = params.top_p if params.top_p is not None else self.default_top_p
           
        # Add optional parameters only if they exist
        if params.stop:
            openai_params["stop"] = params.stop
            
        if params.tools:
            openai_params["tools"] = params.tools
            
        if params.tool_choice:
            openai_params["tool_choice"] = params.tool_choice
            
        # Remove None values
        return {k: v for k, v in openai_params.items() if v is not None}

    def generate(
        self,
        schema: Optional[Type[BaseModel]] = None,
        params: LLMParams | None = None,
        **kwargs
    ) -> LLMResponse:
        """
        Generate text using OpenAI API with support for structured output.
        
        Args:
            schema: Optional Pydantic schema for parsing response
            params: LLM parameters
            **kwargs: Additional parameters to merge with params
        """
        if params is None:
            params = LLMParams(**kwargs)
        else:
            # Merge kwargs with params
            for key, value in kwargs.items():
                if hasattr(params, key) and value is not None:
                    setattr(params, key, value)

        # Prepare OpenAI API parameters
        openai_params = self._prepare_openai_params(params)
        messages = self._prepare_messages(params)
        
        if not messages:
            raise ValueError("No messages or prompt provided")
            
        openai_params["messages"] = messages

        try:
            if schema:
                # Use JSON response_format for structured output
                response = self.client.chat.completions.create(
                    **openai_params,
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                # Parse JSON content into schema
                if content:
                    schema.model_validate_json(content)  # validate only, keep content string
                else:
                    raise ValueError("Empty response from OpenAI")
            else:
                # Standard text generation
                response = self.client.chat.completions.create(**openai_params)
                content = response.choices[0].message.content or ""

            # Extract usage information
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
        params: LLMParams | None = None,
        **kwargs
    ) -> AsyncIterator[LLMResponse]:
        """
        Stream generate text using OpenAI API.
        
        Args:
            schema: Optional Pydantic schema for parsing response
            params: LLM parameters
            **kwargs: Additional parameters to merge with params
        """
        if params is None:
            params = LLMParams(**kwargs)
        else:
            # Merge kwargs with params
            for key, value in kwargs.items():
                if hasattr(params, key) and value is not None:
                    setattr(params, key, value)

        # Ensure streaming is enabled
        params.stream = True
        
        # Prepare OpenAI API parameters
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
                if chunk.choices[0].delta.content:
                    accumulated_content += chunk.choices[0].delta.content

                    partial_usage = Usage(
                        input_tokens=chunk.usage.prompt_tokens if chunk.usage else 0,
                        output_tokens=chunk.usage.completion_tokens if chunk.usage else 0,
                        total_tokens=chunk.usage.total_tokens if chunk.usage else 0,
                    )

                    yield LLMResponse(
                        content=accumulated_content,
                        usage=partial_usage,
                        model=getattr(chunk, "model", self.default_model),
                    )

            if schema and accumulated_content:
                try:
                    schema.model_validate_json(accumulated_content)  # validate only
                except Exception:
                    pass  # keep raw accumulated_content

            final_usage = Usage(
                input_tokens=last_chunk.usage.prompt_tokens if last_chunk and last_chunk.usage else 0,
                output_tokens=last_chunk.usage.completion_tokens if last_chunk and last_chunk.usage else 0,
                total_tokens=last_chunk.usage.total_tokens if last_chunk and last_chunk.usage else 0,
            )

            yield LLMResponse(
                content=accumulated_content,
                usage=final_usage,
                model=getattr(last_chunk, "model", self.default_model),
            )

        except Exception as e:
            raise RuntimeError(f"OpenAI streaming API call failed: {str(e)}") from e


def get_openai_client() -> OpenAIClient:
    """Convenience initializer that returns a ready-to-use OpenAI client"""
    return OpenAIClient()