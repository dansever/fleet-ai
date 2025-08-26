# 📄 app/services/llm/providers/gemini_service.py

from google import genai
from typing import Optional, List
from app.config.config import GEMINI_API_KEY, ACTIVE_GEMINI_MODEL
from app.shared.schemas.ai import LLMResponse, LLMRequest, AIModelUsage
from app.core.ai.llm.provider import LLMProvider
from app.utils.logger import get_logger

logger = get_logger(__name__)


class GeminiProvider(LLMProvider):
    """Gemini LLM provider implementation."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__("gemini", ACTIVE_GEMINI_MODEL)
        self.api_key = api_key or GEMINI_API_KEY
        self.client = None
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("✅ Gemini client initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini client: {e}")
                self.is_available = False
    
    async def generate_response(self, request: LLMRequest) -> LLMResponse:
        """Generate a response using Gemini."""
        if not self.validate_request(request):
            raise ValueError("Invalid LLM request")
        
        if not self.client:
            raise Exception("Gemini client not initialized")
        
        try:
            # Format prompt for Gemini
            prompt = self.format_prompt(request)
            model_name = self.get_model_name(request)
            
            config = {
                "temperature": request.temperature,
                "max_output_tokens": request.max_output_tokens,
                "top_p": request.top_p,
                "stop_sequences": request.stop_sequences or [],
            }
            
            # Handle structured output if requested
            if request.json_schema:
                config["response_mime_type"] = "application/json"
                config["response_schema"] = request.json_schema
            
            response = self.client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )
            
            content = response.text or ""
            parsed = response.parsed
            
            # Extract usage data
            usage_data = response.usage_metadata or {}
            usage = AIModelUsage(
                input_tokens=usage_data.prompt_token_count or 0,
                output_tokens=usage_data.candidates_token_count or 0,
                total_tokens=usage_data.total_token_count or 0,
            )
            
            logger.info(f"✅ Gemini responded — {usage.total_tokens} tokens")
            
            return LLMResponse(
                content=content,
                usage=usage,
                parsed=parsed
            )
            
        except Exception as e:
            logger.exception("❌ Gemini call failed")
            raise Exception(f"Gemini call failed: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check if Gemini provider is healthy."""
        if not self.client:
            return False
        
        try:
            # Try a simple health check
            response = self.client.models.generate_content(
                model=self.default_model,
                contents="Hello",
                config={"max_output_tokens": 10}
            )
            return response.text is not None
        except Exception as e:
            logger.warning(f"Gemini health check failed: {e}")
            return False


# Legacy function for backward compatibility
def run_gemini(
    prompt: str,
    model: str | None = None,
    temperature: float = 0.0,
    max_tokens: int = 1000,
    top_p: float = 1.0,
    stop_sequences: list[str] | None = None,
    api_key: str | None = None,
    response_schema: type | str | None = None
) -> LLMResponse:
    """Legacy function for backward compatibility."""
    provider = GeminiProvider(api_key)
    
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
            raise RuntimeError("Cannot use legacy run_gemini in async context. Use GeminiProvider.generate_response() instead.")
        else:
            return loop.run_until_complete(provider.generate_response(request))
    except RuntimeError:
        raise RuntimeError("Cannot use legacy run_gemini. Use GeminiProvider.generate_response() instead.")