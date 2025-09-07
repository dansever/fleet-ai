# app/ai/extractors/llama_extractor.py
from __future__ import annotations

from typing import Any, Optional, Type
from pydantic import BaseModel

from llama_cloud import ChunkMode, ExtractConfig, ExtractMode, ExtractTarget
from llama_cloud_services import LlamaExtract
from llama_cloud.core.api_error import ApiError

from app.utils import get_logger
from app.config import ai_config

logger = get_logger(__name__)

class LlamaExtractorClient:
    """
    Reusable client wrapper for Llama Cloud's Extract API.
    Encapsulates config validation, logging, and agent lifecycle.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        organization_id: Optional[str] = None,
        project_id: Optional[str] = None,
        update_extractor_schema: Optional[bool] = None,
    ):
        # Resolve from explicit args, then from app config
        api_key = api_key or getattr(ai_config.llama, "cloud_api_key", None)
        organization_id = organization_id or getattr(ai_config.llama, "organization_id", None)
        project_id = project_id or getattr(ai_config.llama, "extract_project_id", None)
        update_extractor_schema = (
            update_extractor_schema
            if update_extractor_schema is not None
            else getattr(ai_config.features, "update_extractor_schema", False)
        )

        # Validate required settings once
        missing = []
        if not api_key:
            missing.append("LLAMA_CLOUD_API_KEY")
        if not project_id:
            missing.append("LLAMA_EXTRACT_PROJECT_ID")
        if not organization_id:
            missing.append("LLAMA_ORGANIZATION_ID")
        if missing:
            raise ValueError(f"Missing required Llama Cloud settings: {', '.join(missing)}")

        self.update_extractor_schema = bool(update_extractor_schema)

        # Initialize underlying SDK client
        self.client = LlamaExtract(
            api_key=api_key,
            organization_id=organization_id,
            project_id=project_id,
        )
        logger.info("Initialized LlamaExtract client")

    # -------- Public API

    def get_or_create_agent(
        self,
        *,
        agent_name: str,
        system_prompt: str,
        data_schema: Type[BaseModel] | Type[Any],
        extraction_mode: ExtractMode = ExtractMode.BALANCED,
        extraction_target: ExtractTarget = ExtractTarget.PER_DOC,
        use_reasoning: bool = False,
        cite_sources: bool = False,
        chunk_mode: ChunkMode = ChunkMode.PAGE,
        invalidate_cache: bool = False,
        high_resolution_mode: bool = True,
    ) -> Any:
        """
        Idempotently return an existing agent by name or create a new one.

        Args:
            agent_name: Unique name for the extractor agent
            system_prompt: System prompt for extraction behavior
            data_schema: Pydantic schema class for structured output
            extraction_mode: Extraction behavior preset
            extraction_target: PER_DOC or PER_PAGE
            use_reasoning: Enable reasoning if supported
            cite_sources: Include citations if supported
            chunk_mode: PAGE, SECTION, or other modes
            invalidate_cache: Force reprocessing
            high_resolution_mode: Enable high resolution parsing

        Returns:
            Provider agent object as returned by the SDK.
        """
        agent = self._try_get_agent(agent_name)

        if agent:
            logger.info(f"Found existing LlamaExtract agent: {agent_name}")
            if self.update_extractor_schema:
                self._sync_agent_schema(agent, data_schema)
            return agent

        # Not found; create a new agent
        config = ExtractConfig(
            extraction_mode=extraction_mode,
            extraction_target=extraction_target,
            system_prompt=system_prompt,
            chunk_mode=chunk_mode,
            high_resolution_mode=high_resolution_mode,
            invalidate_cache=invalidate_cache,
            use_reasoning=use_reasoning,
            cite_sources=cite_sources,
        )
        return self._create_agent(agent_name=agent_name, data_schema=data_schema, config=config)

    # Optionally expose simple fetch if you need it elsewhere
    def get_agent(self, name: str) -> Any | None:
        return self._try_get_agent(name)

    # -------- Internals

    def _try_get_agent(self, name: str) -> Any | None:
        try:
            agent = self.client.get_agent(name=name)
            return agent
        except ApiError as e:
            # 404 means not found, treat as None; bubble up everything else
            if getattr(e, "status_code", None) == 404:
                return None
            logger.error(f"Error fetching LlamaExtract agent '{name}': {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching LlamaExtract agent '{name}': {e}")
            raise

    def _create_agent(self, *, agent_name: str, data_schema: Type[BaseModel] | Type[Any], config: ExtractConfig) -> Any:
        try:
            logger.info(f"Creating new LlamaExtract agent: {agent_name}")
            agent = self.client.create_agent(
                name=agent_name,
                data_schema=data_schema,
                config=config,
            )
            logger.info(f"Created new LlamaExtract agent: {agent_name}")
            return agent
        except ApiError as e:
            logger.error(f"API error creating LlamaExtract agent '{agent_name}': {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating LlamaExtract agent '{agent_name}': {e}")
            raise

    def _sync_agent_schema(self, agent: Any, data_schema: Type[BaseModel] | Type[Any]) -> None:
        try:
            # Some SDKs return a different object type; be permissive but safe
            current = getattr(agent, "data_schema", None)
            if current is not data_schema:
                agent.data_schema = data_schema
                # Some SDKs use .save(), others use .update(); keep .save() per your snippet
                agent.save()
                logger.info(f"Updated data_schema for agent '{getattr(agent, 'name', '<unknown>')}'")
        except ApiError as e:
            logger.error(f"API error updating agent schema: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error updating agent schema: {e}")
            raise


# Convenience initializer to mirror your OpenAI get_openai_client()
def get_llama_extractor_client(
    update_extractor_schema: Optional[bool] = None,
) -> LlamaExtractorClient:
    return LlamaExtractorClient(
        update_extractor_schema=update_extractor_schema,
    )