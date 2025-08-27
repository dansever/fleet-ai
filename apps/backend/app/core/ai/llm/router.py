"""
LLM provider router and registry.
Manages different LLM providers and routes requests to the appropriate one.
"""

from typing import Dict, Optional, Type, Any
from app.core.ai.llm.provider import LLMProvider
from app.config.config import ACTIVE_LLM_PROVIDER
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Global provider registry
_providers: Dict[str, LLMProvider] = {}
_default_provider: Optional[str] = None


async def register_llm_provider(name: str, provider: LLMProvider, set_as_default: bool = False) -> None:
    """
    Register an LLM provider.
    
    Args:
        name: Provider name/identifier
        provider: Provider instance
        set_as_default: Whether to set this as the default provider
    """
    _providers[name] = provider
    
    if set_as_default or _default_provider is None:
        _default_provider = name
        logger.info(f"✅ Registered LLM provider '{name}' as default")
    else:
        logger.info(f"✅ Registered LLM provider '{name}'")
    
    # Verify provider health
    try:
        is_healthy = await provider.health_check()
        if not is_healthy:
            logger.warning(f"⚠️ Provider '{name}' health check failed")
    except Exception as e:
        logger.error(f"❌ Error checking provider '{name}' health: {e}")


def get_llm_provider(name: Optional[str] = None) -> LLMProvider:
    """
    Get an LLM provider by name or the default provider.
    
    Args:
        name: Provider name, or None for default
        
    Returns:
        LLM provider instance
        
    Raises:
        ValueError: If no provider is available
    """
    provider_name = name or _default_provider or ACTIVE_LLM_PROVIDER
    
    if provider_name not in _providers:
        raise ValueError(f"No LLM provider registered with name '{provider_name}'")
    
    provider = _providers[provider_name]
    
    if not provider.is_available:
        # Try to find an available provider
        for p_name, p in _providers.items():
            if p.is_available:
                logger.warning(f"⚠️ Provider '{provider_name}' unavailable, using '{p_name}' instead")
                return p
        
        raise ValueError("No available LLM providers")
    
    return provider


def get_available_providers() -> Dict[str, Dict[str, Any]]:
    """Get information about all available providers."""
    return {
        name: provider.get_provider_info() 
        for name, provider in _providers.items()
    }


def get_default_provider_name() -> Optional[str]:
    """Get the name of the default provider."""
    return _default_provider


async def initialize_providers() -> None:
    """Initialize all registered providers."""
    logger.info("🚀 Initializing LLM providers...")
    
    for name, provider in _providers.items():
        try:
            is_healthy = await provider.health_check()
            provider.is_available = is_healthy
            
            if is_healthy:
                logger.info(f"✅ Provider '{name}' initialized successfully")
            else:
                logger.warning(f"⚠️ Provider '{name}' initialization failed")
                
        except Exception as e:
            logger.error(f"❌ Error initializing provider '{name}': {e}")
            provider.is_available = False


# Auto-register providers on module import
async def _auto_register_providers():
    """Auto-register available providers."""
    try:
        from app.services.llm.providers.gemini_service import GeminiProvider
        from app.services.llm.providers.openai_service import OpenAIProvider
        
        # Register Gemini provider
        gemini_provider = GeminiProvider()
        register_llm_provider("gemini", gemini_provider, set_as_default=True)
        
        # Register OpenAI provider
        openai_provider = OpenAIProvider()
        register_llm_provider("openai", openai_provider)
        
        logger.info("✅ Auto-registered LLM providers")
        
    except ImportError as e:
        logger.warning(f"⚠️ Could not auto-register some providers: {e}")
    except Exception as e:
        logger.error(f"❌ Error auto-registering providers: {e}")


# Initialize providers when module is imported
import asyncio
try:
    asyncio.create_task(_auto_register_providers())
except RuntimeError:
    # Event loop not running, will initialize later
    pass
