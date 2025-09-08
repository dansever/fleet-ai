from fastapi import File, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger, flatten_dict
from app.services import extract_document
from .contract_config import LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME, CONTRACT_EXTRACTOR_SYSTEM_PROMPT
from app.schemas.contract import Contract
from app.config import ai_config
import os
import json
from datetime import datetime
from app.db.operations import create_contract

DEBUG_MODE = ai_config.features.debug_mode

logger = get_logger(__name__)

async def process_contract(file: UploadFile = File(...), org_id: str = None) -> ResponseEnvelope:
    """Process contracts from a file"""
    logger.info(f"📄 Received contract processing request for: {file.filename}")
    
    # ============== 1 - extraction ==============
    extraction_result = extract_document(
        file=file, 
        agent_name=LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME,
        system_prompt=CONTRACT_EXTRACTOR_SYSTEM_PROMPT,
        schema_class=Contract,
        log_label="Contract",
        )
    
    # ============== 2 - DEBUG: Write to mock data ==============
    if DEBUG_MODE:
            # write result.data to file
            cache_dir = os.path.join(os.getcwd(), "mock_data", "contract_cache")
            os.makedirs(cache_dir, exist_ok=True)
            cache_file = os.path.join(cache_dir, f"{datetime.now().strftime('%Y-%m-%d_%H-%M')}.json")
            with open(cache_file, "w") as f:
                json.dump(extraction_result.data, f, indent=2, default=str)
    
    # ============== 3 - Write to Database ==============
    flattened_data = flatten_dict(extraction_result.data)
    # TODO - get org_id from clerk_org_id
    
    await create_contract(organization_id=org_id, contract=flattened_data)

    # ============== 4 - Return Response ==============
    return ResponseEnvelope(
        data=extraction_result.data, 
        success=True, 
        message="Contract processing completed successfully")