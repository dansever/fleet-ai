# 📄 app/services/llm/llm_runner.py

from pydantic import BaseModel
from app.core.ai.llm.router import get_llm_provider
from app.shared.schemas.ai import LLMResponse, LLMRequest, AIModelUsage
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def run_llm(
    prompt: str, 
    response_schema: BaseModel | str | None = None,
    **kwargs
) -> LLMResponse:
    """
    Async wrapper for LLM providers that handles routing to the appropriate service.
    
    Args:
        prompt: The input prompt for the LLM
        response_schema: Desired schema for the response (e.g., "json", "xml", "text")
        **kwargs: Additional parameters passed to the specific LLM provider
    """
    try:
        # Get the default LLM provider
        llm_provider = get_llm_provider()
        
        # Create LLM request
        request = LLMRequest(
            prompt=prompt,
            json_schema=response_schema,
            **kwargs
        )
        
        # Generate response
        response = await llm_provider.generate_response(request)
        return response
        
    except Exception as e:
        logger.error(f"❌ LLM call failed: {e}")
        return LLMResponse(
            success=False,
            content="",
            usage=AIModelUsage(),
            error=str(e)
        )


def run_llm_sync(
    prompt: str, 
    response_schema: BaseModel | str | None = None,
    **kwargs
) -> LLMResponse:
    """
    Synchronous wrapper for LLM providers (for backward compatibility).
    
    Args:
        prompt: The input prompt for the LLM
        response_schema: Desired schema for the response
        **kwargs: Additional parameters
    """
    import asyncio
    
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            raise RuntimeError("Cannot use run_llm_sync in async context. Use run_llm() instead.")
        else:
            return loop.run_until_complete(run_llm(prompt, response_schema, **kwargs))
    except RuntimeError:
        raise RuntimeError("Cannot use run_llm_sync. Use run_llm() instead.")


async def run_llm_with_provider(
    provider_name: str,
    prompt: str,
    response_schema: BaseModel | str | None = None,
    **kwargs
) -> LLMResponse:
    """
    Run LLM with a specific provider.
    
    Args:
        provider_name: Name of the provider to use
        prompt: The input prompt for the LLM
        response_schema: Desired schema for the response
        **kwargs: Additional parameters
    """
    try:
        # Get the specified LLM provider
        llm_provider = get_llm_provider(provider_name)
        
        # Create LLM request
        request = LLMRequest(
            prompt=prompt,
            json_schema=response_schema,
            **kwargs
        )
        
        # Generate response
        response = await llm_provider.generate_response(request)
        return response
        
    except Exception as e:
        logger.error(f"❌ LLM call with provider '{provider_name}' failed: {e}")
        return LLMResponse(
            success=False,
            content="",
            usage=AIModelUsage(),
            error=str(e)
        )