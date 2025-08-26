# 📄 app/services/llm/providers/openai_service.py

import openai
from typing import Optional, List, Dict, Any
from app.shared.schemas.ai import LLMResponse, LLMRequest, AIModelUsage
from app.core.ai.llm.provider import LLMProvider
from app.utils.logger import get_logger
import os

logger = get_logger(__name__)


class OpenAIProvider(LLMProvider):
    """OpenAI LLM provider implementation."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__("openai", "gpt-4")
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        
        if self.api_key:
            try:
                self.client = openai.OpenAI(api_key=self.api_key)
                logger.info("✅ OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize OpenAI client: {e}")
                self.is_available = False
        else:
            logger.warning("⚠️ No OpenAI API key provided")
            self.is_available = False
    
    async def generate_response(self, request: LLMRequest) -> LLMResponse:
        """Generate a response using OpenAI."""
        if not self.validate_request(request):
            raise ValueError("Invalid LLM request")
        
        if not self.client:
            raise Exception("OpenAI client not initialized")
        
        try:
            # Format prompt for OpenAI
            prompt = self.format_prompt(request)
            model_name = self.get_model_name(request)
            
            # Prepare messages
            messages = []
            if request.system:
                messages.append({"role": "system", "content": request.system})
            messages.append({"role": "user", "content": prompt})
            
            # Prepare parameters
            params = {
                "model": model_name,
                "messages": messages,
                "temperature": request.temperature,
                "max_tokens": request.max_output_tokens,
                "top_p": request.top_p,
            }
            
            if request.stop_sequences:
                params["stop"] = request.stop_sequences
            
            # Handle structured output if requested
            if request.json_schema:
                params["response_format"] = {"type": "json_object"}
            
            response = self.client.chat.completions.create(**params)
            
            content = response.choices[0].message.content or ""
            
            # Extract usage data
            usage_data = response.usage
            usage = AIModelUsage(
                input_tokens=usage_data.prompt_tokens,
                output_tokens=usage_data.completion_tokens,
                total_tokens=usage_data.total_tokens,
            )
            
            logger.info(f"✅ OpenAI responded — {usage.total_tokens} tokens")
            
            return LLMResponse(
                content=content,
                usage=usage,
                parsed=None  # OpenAI doesn't provide parsed output like Gemini
            )
            
        except Exception as e:
            logger.exception("❌ OpenAI call failed")
            raise Exception(f"OpenAI call failed: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check if OpenAI provider is healthy."""
        if not self.client:
            return False
        
        try:
            # Try a simple health check
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            return response.choices[0].message.content is not None
        except Exception as e:
            logger.warning(f"OpenAI health check failed: {e}")
            return False


# Legacy function for backward compatibility
def run_openai(
    prompt: str,
    model: Optional[str] = None,
    temperature: float = 0.0,
    max_tokens: int = 1000,
    top_p: float = 1.0,
    stop_sequences: Optional[List[str]] = None,
    api_key: Optional[str] = None,
    response_schema: Optional[type] = None
) -> LLMResponse:
    """Legacy function for backward compatibility."""
    provider = OpenAIProvider(api_key)
    
    request = LLMRequest(
        prompt=prompt,
        model=model,
        temperature=temperature,
        max_output_tokens=max_tokens,
        top_p=top_p,
        stop_sequences=stop_sequences,
        json_schema=response_schema
    )
    
    # Note: This is synchronous but the provider is async
    # For backward compatibility, we'll handle this differently
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If we're in an async context, we can't run sync
            raise RuntimeError("Cannot use legacy run_openai in async context. Use OpenAIProvider.generate_response() instead.")
        else:
            return loop.run_until_complete(provider.generate_response(request))
    except RuntimeError:
        raise RuntimeError("Cannot use legacy run_openai. Use OpenAIProvider.generate_response() instead.") 