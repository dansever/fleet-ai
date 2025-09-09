# backend/app/config/ai_config.py
from enum import Enum
from typing import Tuple
import os
from pydantic import BaseModel

# ---------- Static ----------
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
    llama = "llama"
    tavily = "tavily"

# ---------- Model enums by platform and service kind ----------
class OpenAIChatModel(str, Enum):
    gpt_5 = "gpt-5"
    gpt_5_mini = "gpt-5-mini"
    gpt_5_nano = "gpt-5-nano"

class OpenAIEmbeddingModel(str, Enum):
    text_embedding_3_small = "text-embedding-3-small"
    text_embedding_3_large = "text-embedding-3-large"

# ---------- Per-platform settings ----------
class OpenAISettings(BaseModel):
    api_key: str | None = None
    chat_model: OpenAIChatModel = OpenAIChatModel.gpt_5_nano
    embedding_model: OpenAIEmbeddingModel = OpenAIEmbeddingModel.text_embedding_3_small

class LlamaSettings(BaseModel):
    cloud_api_key: str | None = None
    organization_id: str | None = None
    extract_project_id: str | None = None

class TavilySettings(BaseModel):
    api_key: str | None = None
    
# ---------- Feature flags ----------
class FeatureFlags(BaseModel):
    update_extraction_schema: bool = False
    debug_mode: bool = True

# ---------- Active model routing ----------
class ActiveModels(BaseModel):
    # Choose a platform per service kind
    chat_platform: AIPlatform = AIPlatform.openai
    embedding_platform: AIPlatform = AIPlatform.openai
    extraction_platform: AIPlatform = AIPlatform.llama

    # Optional hard overrides of model ids per service kind
    chat_model_id_override: str | None = None
    embedding_model_id_override: str | None = None
    extraction_model_id_override: str | None = None

# ---------- Top-level config ----------
class AIConfig(BaseModel):
    openai: OpenAISettings = OpenAISettings()
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
        self.llama.cloud_api_key = os.getenv("LLAMA_CLOUD_API_KEY")
        self.llama.organization_id = os.getenv("LLAMA_ORGANIZATION_ID")
        self.llama.extract_project_id = os.getenv("LLAMA_EXTRACT_PROJECT_ID")
        self.tavily.api_key = os.getenv("TAVILY_API_KEY")

    # ---------- Resolved model ids ----------
    @property
    def active_chat_model_id(self) -> str:
        if self.active.chat_model_id_override:
            return self.active.chat_model_id_override
        pf = self.active.chat_platform
        if pf == AIPlatform.openai:
            return self.openai.chat_model.value
        if pf == AIPlatform.llama:
            raise ValueError(
                "No default chat model configured for chat_platform=llama. "
                "Provide ActiveModels.chat_model_id_override."
            )
        raise ValueError(f"Unsupported chat_platform: {pf}")

    @property
    def active_embedding_model_id(self) -> str | None:
        if self.active.embedding_model_id_override:
            return self.active.embedding_model_id_override
        pf = self.active.embedding_platform
        if pf == AIPlatform.openai:
            return self.openai.embedding_model.value
        return None

    @property
    def active_extraction_model_id(self) -> str | None:
        if self.active.extraction_model_id_override:
            return self.active.extraction_model_id_override
        return None

    # ---------- Active API key by service kind ----------
    def api_key_for(self, platform: AIPlatform) -> str | None:
        if platform == AIPlatform.openai:
            return self.openai.api_key
        if platform == AIPlatform.llama:
            return self.llama.cloud_api_key
        if platform == AIPlatform.tavily:
            return self.tavily.api_key
        return None

    @property
    def active_chat_api_key(self) -> str | None:
        return self.api_key_for(self.active.chat_platform)

    @property
    def active_embedding_api_key(self) -> str | None:
        return self.api_key_for(self.active.embedding_platform)

    @property
    def active_extraction_api_key(self) -> str | None:
        return self.api_key_for(self.active.extraction_platform)

    def validate(self) -> None:
        """
        Call once on startup to confirm model routing and required secrets exist.
        Raises ValueError with a clear message if something is misconfigured.
        """
        # Chat
        _ = self.active_chat_model_id  # will raise if misconfigured
        if not self.active_chat_api_key:
            raise ValueError(f"Missing API key for chat platform: {self.active.chat_platform}")

        # Embeddings
        if self.active.embedding_platform == AIPlatform.openai:
            if not self.active_embedding_model_id:
                raise ValueError("No active embedding model id configured for OpenAI embeddings.")
            if not self.active_embedding_api_key:
                raise ValueError("Missing API key for embeddings platform: openai")

        # Extraction
        if self.active.extraction_platform == AIPlatform.llama:
            if not self.llama.extract_project_id:
                raise ValueError("LLAMA_EXTRACT_PROJECT_ID is required when extraction_platform=llama.")
            if not self.active_extraction_api_key:
                raise ValueError("LLAMA_CLOUD_API_KEY is required when extraction_platform=llama.")
