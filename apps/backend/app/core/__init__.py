"""
Core functionality package for FleetAI backend.
Contains AI, agents, and core business logic components.
"""

from .ai import AIClient, LLMProvider, get_llm_provider, register_llm_provider

__all__ = [
    "AIClient",
    "LLMProvider", 
    "get_llm_provider",
    "register_llm_provider"
]
