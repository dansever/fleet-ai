# config/ai.py
from enum import Enum
from typing import Tuple, Optional
import os
from pydantic import BaseModel, Field

# ---------- Static ----------
MIME_TYPE_PDF = "application/pdf"
MAX_ENTITIES_PER_BATCH = 20
EXTRACTOR_ALLOWED_EXTENSIONS: Tuple[str, ...] = (".pdf", ".docx")
EXTRACTOR_ALLOWED_MIME_TYPES: Tuple[str, ...] = (
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)

# ---------- Enums ----------
class LLMProvider(str, Enum):
    openai = "openai"
    gemini = "gemini"

class OpenAIModel(str, Enum):
    gpt_5 = "gpt-5"
    gpt_5_mini = "gpt-5-mini"
    gpt_5_nano = "gpt-5-nano"

class GeminiModel(str, Enum):
    flash = "gemini-2.0-flash"
    pro = "gemini-1.5-pro"
    pro_vision = "gemini-1.5-pro-vision"

# ---------- Provider settings ----------
class OpenAISettings(BaseModel):
    api_key: Optional[str] = None
    active_model: OpenAIModel = OpenAIModel.gpt_5_nano

class GeminiSettings(BaseModel):
    api_key: Optional[str] = None
    active_model: GeminiModel = GeminiModel.flash

class LlamaSettings(BaseModel):
    cloud_api_key: Optional[str] = None
    extract_project_id: Optional[str] = None
    organization_id: Optional[str] = None

# ---------- Feature flags ----------
class FeatureFlags(BaseModel):
    update_extractor_schema: bool = False
    debug_mode: bool = False

# ---------- Top-level config ----------
class AIConfig(BaseModel):
    active_llm_provider: LLMProvider = LLMProvider.openai
    active_llm_model: Optional[str] = None
    
    openai: OpenAISettings = OpenAISettings()
    gemini: GeminiSettings = GeminiSettings()
    llama: LlamaSettings = LlamaSettings()
    features: FeatureFlags = FeatureFlags()
    
    allowed_extensions: Tuple[str, ...] = EXTRACTOR_ALLOWED_EXTENSIONS
    allowed_mime_types: Tuple[str, ...] = EXTRACTOR_ALLOWED_MIME_TYPES
    max_entities_per_batch: int = MAX_ENTITIES_PER_BATCH

    def __init__(self, **data):
        super().__init__(**data)
        # Load from environment variables
        self.openai.api_key = os.getenv("OPENAI_API_KEY")
        self.gemini.api_key = os.getenv("GEMINI_API_KEY")
        self.llama.cloud_api_key = os.getenv("LLAMA_CLOUD_API_KEY")
        self.llama.extract_project_id = os.getenv("LLAMA_EXTRACT_PROJECT_ID")
        self.llama.organization_id = os.getenv("LLAMA_ORGANIZATION_ID")
        
        # Load provider and model
        provider = os.getenv("ACTIVE_LLM_PROVIDER")
        if provider:
            try:
                self.active_llm_provider = LLMProvider(provider)
            except ValueError:
                pass  # Keep default
        
        model = os.getenv("ACTIVE_LLM_MODEL")
        if model:
            self.active_llm_model = model

    @property
    def active_model_id(self) -> str:
        if self.active_llm_model:
            return self.active_llm_model
        return (
            self.openai.active_model.value
            if self.active_llm_provider == LLMProvider.openai
            else self.gemini.active_model.value
        )

    @property
    def active_api_key(self) -> Optional[str]:
        return (
            self.openai.api_key
            if self.active_llm_provider == LLMProvider.openai
            else self.gemini.api_key
        )