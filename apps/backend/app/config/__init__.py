"""
Configuration module for FleetAI backend.
Provides typed enums, settings classes, and a top-level AIConfig instance.
"""

from .config import (
    AIConfig,
    LLMProvider,
    OpenAIModel,
    GeminiModel,
)

# Convenience singleton so you can just `from config import ai_config`
ai_config = AIConfig()

__all__ = [
    # Classes
    "AIConfig",
    "LLMProvider",
    "OpenAIModel",
    "GeminiModel",
    # Singleton
    "ai_config",
]