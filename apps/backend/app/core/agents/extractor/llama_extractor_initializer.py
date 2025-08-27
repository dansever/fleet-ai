from typing import Any, Type
from llama_cloud import ChunkMode, ExtractConfig, ExtractMode, ExtractTarget
from llama_cloud_services import LlamaExtract
from llama_cloud.core.api_error import ApiError
from app.utils import get_logger
from app.config import (
    ai_config
)


logger = get_logger(__name__)

def get_llama_extractor(
    # Required parameters
    agent_name: str,
    system_prompt: str,
    data_schema: Type[Any],
    # Default values are set to the values used in the LlamaExtract API
    extraction_mode: ExtractMode = ExtractMode.BALANCED,
    extraction_target: ExtractTarget = ExtractTarget.PER_DOC,
    use_reasoning: bool = False,
    cite_sources: bool = False,
    chunk_mode: ChunkMode = ChunkMode.PAGE,
    invalidate_cache: bool = False
):
    """
    Return an existing LlamaExtract agent by name or create one if missing.
    
    Args:
        agent_name: Name of the agent to create
        system_prompt: System prompt for the extraction agent
        data_schema: Pydantic schema class for data extraction
        extraction_target: Target for extraction (default: "PER_DOC")
        extraction_mode: Mode for extraction (default: "BALANCED")
        use_reasoning: Whether to use reasoning (default: False)
        cite_sources: Whether to cite sources (default: False)
        chunk_mode: Mode for chunking (default: "SECTION")
        invalidate_cache: Whether to invalidate cache (default: False)
    
    Returns:
        The LlamaExtract agent instance.
    """
    
    # Validate required environment variables
    if not ai_config.llama.cloud_api_key:
        raise ValueError("LLAMA_CLOUD_API_KEY environment variable is not set")
    if not ai_config.llama.extract_project_id:
        raise ValueError("LLAMA_EXTRACT_PROJECT_ID environment variable is not set")
    if not ai_config.llama.organization_id:
        raise ValueError("LLAMA_ORGANIZATION_ID environment variable is not set")
        
    # Initialize the LlamaExtract client
    extractor = LlamaExtract(
        api_key=ai_config.llama.cloud_api_key,
        organization_id=ai_config.llama.organization_id,
        project_id=ai_config.llama.extract_project_id,
    )
    logger.info(f"Initialized LlamaExtract client")

    # Try to fetch an existing agent
    try:
        agent = extractor.get_agent(name=agent_name)
        if agent is not None:
            if UPDATE_EXTRACTOR_SCHEMA_FLAG:
                agent.data_schema = data_schema
                agent.save()
                logger.info(f"Updated schema for: {agent_name}")
            return agent
    except ApiError as e:
        if e.status_code != 404:
            logger.error(f"Error getting {agent_name}: {e}")
            raise e  # Only suppress "not found" errors

    # Create extraction configuration
    config = ExtractConfig(
        # Basic options
        extraction_mode=extraction_mode, # BALANCED, MULTIMODAL, MULTIMODAL, PREMIUM
        extraction_target=extraction_target, # PER_DOC, PER_PAGE
        system_prompt=system_prompt,

        # Advanced options
        chunk_mode=chunk_mode,     # PAGE, SECTION
        high_resolution_mode=True,     # Enable for better OCR
        invalidate_cache=False,        # Set to True to bypass cache

        # Extensions (see Extensions page for details)
        use_reasoning=use_reasoning,
        cite_sources=cite_sources,
    )

    try:
        # Create new extraction agent 
        agent = extractor.create_agent(
            name=agent_name,
            data_schema=data_schema,
            config=config,
        )
        logger.info(f"Created new LlamaExtract agent: {agent_name}")
        return agent
    except Exception as e:
        logger.error(f"Error creating agent {agent_name}: {e}")
        raise