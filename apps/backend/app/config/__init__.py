"""
Configuration module for FleetAI backend.
All configuration values are imported from the main config.py file.
"""

from .config import *

__all__ = [
    # File Upload Configurations
    "EXTRACTOR_ALLOWED_EXTENSIONS",
    "EXTRACTOR_ALLOWED_MIME_TYPES",
    "MIME_TYPE_PDF",
    "MAX_ENTITIES_PER_BATCH",
    
    # Flags
    "UPDATE_EXTRACTOR_SCHEMA_FLAG",
    "DEBUG_MODE_FLAG",
    
    # LLM Provider
    "ACTIVE_LLM_PROVIDER",
    
    # Llama
    "LLAMA_CLOUD_API_KEY", 
    "LLAMA_EXTRACT_PROJECT_ID", 
    "LLAMA_ORGANIZATION_ID",
    
    # Gemini
    "GEMINI_API_KEY",
    "GEMINI_MODELS",
    "ACTIVE_GEMINI_MODEL",
    
    # OpenAI
    "OPENAI_API_KEY",
    "OPENAI_MODELS",
    "ACTIVE_OPENAI_MODEL"
]