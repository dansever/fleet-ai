# backend/app/features/technical/rfq_extractor.py
import os
import json
from fastapi import File, UploadFile
from datetime import datetime
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.services import process_document_extraction
from .rfqs_config import LLAMA_RFQ_EXTRACTOR_AGENT_NAME, RFQ_EXTRACTOR_SYSTEM_PROMPT
from app.schemas.rfq import RFQ

from app.config import ai_config

DEBUG_MODE = ai_config.features.debug_mode

logger = get_logger(__name__)

def extract_rfq(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Extract structured RFQ data from a document file"""

    logger.info(f"📄 Received RFQ extraction request for: {file.filename}")
    
    # run extraction once
    result = process_document_extraction(
        file=file, 
        agent_name=LLAMA_RFQ_EXTRACTOR_AGENT_NAME,
        system_prompt=RFQ_EXTRACTOR_SYSTEM_PROMPT,
        schema_class=RFQ,
        log_label="RFQ",
        )

    logger.info("✅ RFQ extraction completed successfully")

    if DEBUG_MODE:
        # write result.data to file
        cache_dir = os.path.join(os.getcwd(), "mock_data", "rfq_cache")
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f"{datetime.now().strftime('%Y-%m-%d_%H-%M')}.json")
        with open(cache_file, "w") as f:
            json.dump(result.data, f, indent=2, default=str)

    # wrap back into ResponseEnvelope so the return type is the same
    return ResponseEnvelope(
        data=result.data,
        success=True, 
        message="RFQ extraction completed successfully"
        )