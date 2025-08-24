from typing import Any, Type
from llama_cloud import ExtractConfig
from llama_cloud_services import LlamaExtract
from llama_cloud.core.api_error import ApiError
from app.utils import get_logger
from app.core.agents.document_extractor.config import LLAMA_CLOUD_API_KEY, LLAMA_EXTRACT_PROJECT_ID, LLAMA_ORGANIZATION_ID

logger = get_logger(__name__)

def initialize_llama_extractor_agent(
    agent_name: str,
    system_prompt: str,
    data_schema: Type[Any],
    extraction_target: str = "PER_DOC",
    extraction_mode: str = "BALANCED",
    use_reasoning: bool = False,
    cite_sources: bool = False,
    chunk_mode: str = "SECTION",
    invalidate_cache: bool = False
):
    """
    Get or create a generic document extraction agent for LlamaExtract.
    
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
        The extraction agent
    """
    
    # Validate required environment variables
    if not LLAMA_CLOUD_API_KEY:
        raise ValueError("LLAMA_CLOUD_API_KEY environment variable is not set")
    if not LLAMA_EXTRACT_PROJECT_ID:
        raise ValueError("LLAMA_EXTRACT_PROJECT_ID environment variable is not set")
    if not LLAMA_ORGANIZATION_ID:
        raise ValueError("LLAMA_ORGANIZATION_ID environment variable is not set")
    
    logger.info(f"Initializing LlamaExtract client with project_id: {LLAMA_EXTRACT_PROJECT_ID}")
    
    # Initialize the LlamaExtract client
    extractor = LlamaExtract(
        api_key=LLAMA_CLOUD_API_KEY,
        organization_id=LLAMA_ORGANIZATION_ID,
        project_id=LLAMA_EXTRACT_PROJECT_ID,
    )

    logger.info(f"Initialized LlamaExtract client")

    try:
        agent = extractor.get_agent(name=agent_name)
        if agent:
            # Update schema
            agent.data_schema = data_schema
            logger.info(f"Using existing LlamaExtract agent: {agent_name}")
            return agent
    except ApiError as e:
        if e.status_code != 404:
            logger.error(f"Error getting agent {agent_name}: {e}")
            raise e  # Only suppress "not found" errors

    logger.info(f"Creating new LlamaExtract agent: {agent_name}")
    
    extract_config = ExtractConfig(
        extraction_target=extraction_target,
        extraction_mode=extraction_mode,
        system_prompt=system_prompt,
        use_reasoning=use_reasoning,
        cite_sources=cite_sources,
        chunk_mode=chunk_mode,
        invalidate_cache=invalidate_cache
    )

    try:
        agent = extractor.create_agent(
            name=agent_name,
            config=extract_config,
            data_schema=data_schema,
        )
        logger.info(f"Created new LlamaExtract agent: {agent_name}")
        return agent
    except Exception as e:
        logger.error(f"Error creating agent {agent_name}: {e}")
        raise