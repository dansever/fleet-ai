from fastapi import File, HTTPException, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger, flatten_dict
from app.services import extract_document
from .contract_config import LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME, CONTRACT_EXTRACTOR_SYSTEM_PROMPT
from app.schemas.contract import Contract
from app.config import ai_config
import os
import json
from datetime import datetime
from app.db.operations import update_contract, get_org_by_clerk_org_id
from app.utils.io import load_latest_extraction_result

DEBUG_MODE = ai_config.features.debug_mode
USE_MOCK_DATA = False

logger = get_logger(__name__)

async def process_contract(
    file: UploadFile = File(...), 
    contract_id: str = None, 
    clerk_org_id: str = None) -> ResponseEnvelope:
    """Process contracts from a file"""
    try:
        logger.info(f"📄 Received contract processing request for: {file.filename}")
        
        # ============== 1 - extraction ==============
        if not USE_MOCK_DATA:
            extraction_result = await extract_document(
                file=file, 
                agent_name=LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME,
                system_prompt=CONTRACT_EXTRACTOR_SYSTEM_PROMPT,
                schema_class=Contract,
                log_label="Contract",
                )    
        else:
            extraction_result = load_latest_extraction_result("mock_data/contract_cache")
            
        # ============== 2 - Flatten data ==============
        extraction_result = flatten_dict(extraction_result) 

        # ============== DEBUG: Write to mock data ==============
        if DEBUG_MODE:
            if not USE_MOCK_DATA:
                # write result.data to file
                cache_dir = os.path.join(os.getcwd(), "mock_data", "contract_cache")
                os.makedirs(cache_dir, exist_ok=True)
                cache_file = os.path.join(cache_dir, f"{datetime.now().strftime('%Y-%m-%d_%H-%M')}.json")
                with open(cache_file, "w") as f:
                    json.dump(extraction_result, f, indent=2, default=str)
        
        # ============== 4 - Write to Database ==============
        # Get DB Org ID from Clerk Org ID
        org = await get_org_by_clerk_org_id(clerk_org_id)
        
        # Upadte a copy so to not mutate the original extraction_result
        contract_data = {k: v for k, v in extraction_result.items() if k not in ("title", "contract_type")}
        await update_contract(
            contract_id=contract_id,
            org_id=org.id,
            contract=contract_data
        )        

        # ============== 4 - Return Response ==============
        return ResponseEnvelope(
            data=extraction_result,
            success=True,
            message="Contract processed successfully"
        )
    
    except Exception as e:
        logger.exception(f"❌ Error in contract processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process contract: {str(e)}")