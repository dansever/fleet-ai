"""
Configuration module for FleetAI backend.
Provides typed enums, settings classes, and a top-level AIConfig instance.
"""

from .ai_config import (
    AIConfig,
    LLMProvider,
    OpenAIModel,
    GeminiModel,
)

# Singleton config so we can `from config import ai_config` anywhere
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