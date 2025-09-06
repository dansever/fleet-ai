# backend/app/config/ai_config.py
from enum import Enum
from typing import Tuple
import os
from pydantic import BaseModel, Field

# ---------- Static ----------
MIME_TYPE_PDF = "application/pdf"
MAX_ENTITIES_PER_BATCH = 20
ALLOWED_EXTENSIONS: Tuple[str, ...] = (
    ".pdf", 
    ".docx", 
    ".doc",
)
ALLOWED_MIME_TYPES: Tuple[str, ...] = (
    "application/pdf", # for .pdf files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", # for .docx files
    "application/msword",  # for .doc files
)

# ---------- Enums ----------
class AIPlatform(str, Enum):
    openai = "openai"
    gemini = "gemini"
    llama = "llama"
    tavily = "tavily"

# ---------- Model enums by platform and service kind ----------
class OpenAITextModel(str, Enum):
    gpt_5 = "gpt-5"
    gpt_5_mini = "gpt-5-mini"
    gpt_5_nano = "gpt-5-nano"

class OpenAIEmbeddingModel(str, Enum):
    text_embedding_3_small = "text-embedding-3-small"
    text_embedding_3_large = "text-embedding-3-large"

class GeminiTextModel(str, Enum):
    flash = "gemini-2.0-flash"
    pro = "gemini-1.5-pro"
    pro_vision = "gemini-1.5-pro-vision"

# ---------- Per-platform settings ----------
class OpenAISettings(BaseModel):
    api_key: str | None = None
    default_text_model: OpenAITextModel = OpenAITextModel.gpt_5_nano
    default_embedding_model: OpenAIEmbeddingModel = OpenAIEmbeddingModel.text_embedding_3_small

class GeminiSettings(BaseModel):
    api_key: str | None = None
    default_text_model: GeminiTextModel = GeminiTextModel.flash
    # Add default_embedding_model later if you adopt Gemini embeddings

class LlamaSettings(BaseModel):
    cloud_api_key: str | None = None
    organization_id: str | None = None
    extract_project_id: str | None = None

class TavilySettings(BaseModel):
    api_key: str | None = None
    
# ---------- Feature flags ----------
class FeatureFlags(BaseModel):
    update_extractor_schema: bool = False
    debug_mode: bool = False

# ---------- Active model routing ----------
class ActiveModels(BaseModel):
    # Choose a platform per service kind
    platform_for_text: AIPlatform = AIPlatform.openai
    platform_for_embeddings: AIPlatform = AIPlatform.openai
    platform_for_extraction: AIPlatform = AIPlatform.llama

    # Optional hard overrides of model ids per service kind
    text_model_id_override: str | None = None
    embedding_model_id_override: str | None = None
    extractor_model_id_override: str | None = None

# ---------- Top-level config ----------
class AIConfig(BaseModel):
    platforms: Tuple[AIPlatform, ...] = (
        AIPlatform.openai, 
        AIPlatform.gemini, 
        AIPlatform.llama, 
        AIPlatform.tavily)

    openai: OpenAISettings = OpenAISettings()
    gemini: GeminiSettings = GeminiSettings()
    llama: LlamaSettings = LlamaSettings()
    tavily: TavilySettings = TavilySettings()

    active: ActiveModels = ActiveModels()
    features: FeatureFlags = FeatureFlags()

    allowed_extensions: Tuple[str, ...] = ALLOWED_EXTENSIONS
    allowed_mime_types: Tuple[str, ...] = ALLOWED_MIME_TYPES
    max_entities_per_batch: int = MAX_ENTITIES_PER_BATCH

    def __init__(self, **data):
        super().__init__(**data)
        # Only secrets come from env
        self.openai.api_key = os.getenv("OPENAI_API_KEY")
        self.gemini.api_key = os.getenv("GEMINI_API_KEY")
        self.llama.cloud_api_key = os.getenv("LLAMA_CLOUD_API_KEY")
        self.llama.organization_id = os.getenv("LLAMA_ORGANIZATION_ID")
        self.llama.extract_project_id = os.getenv("LLAMA_EXTRACT_PROJECT_ID")
        self.tavily.api_key = os.getenv("TAVILY_API_KEY")

    # ---------- Resolved model ids ----------
    @property
    def active_text_model_id(self) -> str:
        if self.active.text_model_id_override:
            return self.active.text_model_id_override
        pf = self.active.platform_for_text
        if pf == AIPlatform.openai:
            return self.openai.default_text_model.value
        if pf == AIPlatform.gemini:
            return self.gemini.default_text_model.value
        return self.llama.default_text_model  # string

    @property
    def active_embedding_model_id(self) -> str | None:
        if self.active.embedding_model_id_override:
            return self.active.embedding_model_id_override
        pf = self.active.platform_for_embeddings
        if pf == AIPlatform.openai:
            return self.openai.default_embedding_model.value
        # Extend when other platforms’ embeddings are supported
        return None

    @property
    def active_extractor_model_id(self) -> str | None:
        if self.active.extractor_model_id_override:
            return self.active.extractor_model_id_override
        # Example: if extraction is handled by Llama Cloud, you might return a template id here
        # For now, keep None unless you wire a concrete extractor model id
        return None

    # ---------- Active API key by service kind ----------
    def api_key_for(self, platform: AIPlatform) -> str | None:
        if platform == AIPlatform.openai:
            return self.openai.api_key
        if platform == AIPlatform.gemini:
            return self.gemini.api_key
        if platform == AIPlatform.llama:
            return self.llama.cloud_api_key
        return None

    @property
    def active_text_api_key(self) -> str | None:
        return self.api_key_for(self.active.platform_for_text)

    @property
    def active_embedding_api_key(self) -> str | None:
        return self.api_key_for(self.active.platform_for_embeddings)

    @property
    def active_extractor_api_key(self) -> str | None:
        return self.api_key_for(self.active.platform_for_extraction)