"""
LLM functionality for the AI core module.
Provides provider interfaces, routing, and common LLM operations.
"""

from .provider import LLMProvider
from .router import get_llm_provider, register_llm_provider

__all__ = [
    "LLMProvider",
    "get_llm_provider", 
    "register_llm_provider"
]
