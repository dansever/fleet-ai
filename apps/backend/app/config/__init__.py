"""
Configuration module for FleetAI backend.
Provides typed enums, settings classes, and a top-level AIConfig instance.
"""

from .ai_config import (
    AIConfig,
    AIPlatform,
    OpenAITextModel,
    OpenAIEmbeddingModel,
    GeminiTextModel,
    LlamaSettings,
    FeatureFlags,
    ActiveModels,
    OpenAISettings,
    GeminiSettings,
    TavilySettings,
)

# Singleton config so we can `from config import ai_config` anywhere
ai_config = AIConfig()

__all__ = [
    "ai_config", # Singleton instance
    "AIConfig", # Class
    "AIPlatform", # Enum for switching/checking platforms
    "OpenAITextModel",
    "OpenAIEmbeddingModel",
    "LlamaSettings",
    "TavilySettings",
    "FeatureFlags",
    "ActiveModels",    
]