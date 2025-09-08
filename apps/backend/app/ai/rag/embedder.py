from dataclasses import dataclass
from typing import Optional
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings
from typing import Dict, Any


@dataclass
class EmbeddingConfig:
    provider: str = "openai"  # for defaults only
    model: Optional[str] = None  # e.g., "text-embedding-3-large"


def build_embedder(cfg: EmbeddingConfig) -> Embeddings:
    """Create a LangChain Embeddings instance based on config.

    Defaults to OpenAIEmbeddings if available. Replace as needed.
    """
    if cfg.provider.lower() == "openai":
        if OpenAIEmbeddings is None:
            raise RuntimeError(
                "langchain-openai is not installed. `pip install -U langchain-openai`"
            )
        kwargs: Dict[str, Any] = {}
        if cfg.model:
            kwargs["model"] = cfg.model
        return OpenAIEmbeddings(**kwargs)

    raise ValueError(f"Unsupported embeddings provider: {cfg.provider}")