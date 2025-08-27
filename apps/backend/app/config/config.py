import os
from typing import Optional

# Constants
MIME_TYPE_PDF = "application/pdf"
MAX_ENTITIES_PER_BATCH = 20

# File Upload Configurations
EXTRACTOR_ALLOWED_EXTENSIONS = (".pdf", ".docx")
EXTRACTOR_ALLOWED_MIME_TYPES = (
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)

# LLM Provider Configuration
ACTIVE_LLM_PROVIDER = os.getenv("ACTIVE_LLM_PROVIDER")

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODELS = {
    "flash": "gemini-2.0-flash",
    "pro": "gemini-1.5-pro",
    "pro_vision": "gemini-1.5-pro-vision"
}
ACTIVE_GEMINI_MODEL = os.getenv("ACTIVE_GEMINI_MODEL", GEMINI_MODELS["flash"])

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODELS = {
    "gpt4": "gpt-4",
    "gpt35": "gpt-3.5-turbo"
}
ACTIVE_OPENAI_MODEL = os.getenv("ACTIVE_OPENAI_MODEL", OPENAI_MODELS["gpt4"])

# Llama Configuration
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")
LLAMA_EXTRACT_PROJECT_ID = os.getenv("LLAMA_EXTRACT_PROJECT_ID")
LLAMA_ORGANIZATION_ID = os.getenv("LLAMA_ORGANIZATION_ID")

# Feature Flags
UPDATE_EXTRACTOR_SCHEMA_FLAG = os.getenv("UPDATE_EXTRACTOR_SCHEMA_FLAG", "false").lower() == "true"
DEBUG_MODE_FLAG = os.getenv("DEBUG_MODE_FLAG", "false").lower() == "true"