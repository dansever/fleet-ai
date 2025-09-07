from fastapi import File, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.services import process_document_extraction
from .contract_config import LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME, CONTRACT_EXTRACTOR_SYSTEM_PROMPT
from app.schemas.contract import Contract
from app.config import ai_config
import os
import json
from datetime import datetime

DEBUG_MODE = ai_config.features.debug_mode

logger = get_logger(__name__)

def process_contract(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Process contracts from a file"""
    logger.info(f"📄 Received contract processing request for: {file.filename}")
    
    # ============== 1 - extraction ==============
    logger.info(f"📄 Starting contract extraction...")
    result = process_document_extraction(
        file=file, 
        agent_name=LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME,
        system_prompt=CONTRACT_EXTRACTOR_SYSTEM_PROMPT,
        schema_class=Contract,
        log_label="Contract",
        )
    logger.info("✅ Contract extraction completed successfully")

    # ============== 2 - Write to Database ==============
    logger.info(f"📄 Writing contract to database...")
    result = write_contract_to_database(result.data)
    logger.info("✅ Contract write to database completed successfully")


    if DEBUG_MODE:
        # write result.data to file
        cache_dir = os.path.join(os.getcwd(), "mock_data", "contract_cache")
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f"{datetime.now().strftime('%Y-%m-%d_%H-%M')}.json")
        with open(cache_file, "w") as f:
            json.dump(result.data, f, indent=2, default=str)