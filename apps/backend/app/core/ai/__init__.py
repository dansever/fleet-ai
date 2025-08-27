"""
Core AI functionality for FleetAI backend.
Provides unified interfaces for LLM operations, AI services, and AI-related utilities.
"""

from .base import AIServiceBase
from .llm.provider import LLMProvider
from .llm.router import get_llm_provider, register_llm_provider

__all__ = [
    "AIServiceBase",
    "LLMProvider", 
    "get_llm_provider",
    "register_llm_provider"
]
