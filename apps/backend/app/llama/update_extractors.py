import os
from dotenv import load_dotenv
from typing import Any
from llama_cloud_services import LlamaExtract
from llama_cloud import ChunkMode, ExtractConfig, ExtractMode, ExtractTarget
from app.utils import get_logger
# Specialized Schemas
from app.schemas.contract import Contract
from app.schemas.quote import QuoteSchema
from app.schemas.rfq import RFQ
from app.schemas.fuel_bid import FuelBid
from app.llama.extractor_system_prompts import (
    CONTRACT_EXTRACTOR_SYSTEM_PROMPT,
    FUEL_BID_EXTRACTOR_SYSTEM_PROMPT,
    QUOTE_EXTRACTOR_SYSTEM_PROMPT,
    RFQ_EXTRACTOR_SYSTEM_PROMPT,
)

load_dotenv()

logger = get_logger(__name__)

LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME = "fleet-ai-contract-extractor"
LLAMA_QUOTE_EXTRACTOR_AGENT_NAME = "fleet-ai-quote-extractor"
LLAMA_RFQ_EXTRACTOR_AGENT_NAME = "fleet-ai-rfq-extractor"
LLAMA_FUEL_BID_EXTRACTOR_AGENT_NAME = "fleet-ai-fuel-bid-extractor"

def make_config(
    extraction_mode: ExtractMode  = ExtractMode.BALANCED,
    extraction_target: ExtractTarget  = ExtractTarget.PER_DOC,
    system_prompt: str  = "",
    chunk_mode: ChunkMode = ChunkMode.PAGE,
    high_resolution_mode: bool = True,
    invalidate_cache: bool = False,
    use_reasoning: bool = False,
    cite_sources: bool = False,
) -> ExtractConfig:
    """
    Build an ExtractConfig with sensible defaults if arguments are not provided.
    """
    return ExtractConfig(
        extraction_mode = extraction_mode,
        extraction_target = extraction_target,
        system_prompt = system_prompt,
        chunk_mode = chunk_mode,
        high_resolution_mode = high_resolution_mode,
        invalidate_cache = invalidate_cache,
        use_reasoning = use_reasoning,
        cite_sources = cite_sources,
    )

extractor_map = {
    "contract_extractor": {
        "agent_name": LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME,
        "schema": Contract,
        "config": make_config(system_prompt=CONTRACT_EXTRACTOR_SYSTEM_PROMPT),
    },
    "quote_extractor": {
        "agent_name": LLAMA_QUOTE_EXTRACTOR_AGENT_NAME,
        "schema": QuoteSchema,
        "config": make_config(system_prompt=QUOTE_EXTRACTOR_SYSTEM_PROMPT),
    },
    "rfq_extractor": {
        "agent_name": LLAMA_RFQ_EXTRACTOR_AGENT_NAME,
        "schema": RFQ,
        "config": make_config(system_prompt=RFQ_EXTRACTOR_SYSTEM_PROMPT),
    },
    "fuel_bid_extractor": {
        "agent_name": LLAMA_FUEL_BID_EXTRACTOR_AGENT_NAME,
        "schema": FuelBid,
        "config": make_config(system_prompt=FUEL_BID_EXTRACTOR_SYSTEM_PROMPT),
    },
}

def update_extractor_agents() -> list[Any]:
    """
    Ensure all extractor agents exist and have the latest schema + system prompt.
    Returns list of updated/created agents.
    """

    logger.info("✨ Entered update_extractor_agents function...")

    llama_cloud_api_key = os.getenv("LLAMA_CLOUD_API_KEY")
    llama_organization_id = os.getenv("LLAMA_ORGANIZATION_ID")
    llama_extract_project_id = os.getenv("LLAMA_EXTRACT_PROJECT_ID")

    extractor = LlamaExtract(
        api_key=llama_cloud_api_key,
        organization_id=llama_organization_id,
        project_id=llama_extract_project_id,
    )

    updated_agents = []
    
    for extractor_name, extractor_data in extractor_map.items():
      logger.info(f"⏳ Processing {extractor_name}...")
      try:
          agent = extractor.get_agent(name=extractor_data["agent_name"])
      except Exception as e:
          logger.error(f"Error fetching agent {extractor_data['agent_name']}: {e}")
          agent = None

      if agent is None:
        # Create agent
          agent = extractor.create_agent(
              name=extractor_data["agent_name"],
              data_schema=extractor_data["schema"],
              config=extractor_data["config"],
          )
          logger.info(f"🐣 Created {extractor_data['agent_name']}")
      else:
        # Update agent
          agent.data_schema = extractor_data["schema"]
          agent.system_prompt = extractor_data["config"].system_prompt
          agent.save()
          logger.info(f"✅ Updated {extractor_data['agent_name']}")

      updated_agents.append(agent)
   
    return updated_agents
