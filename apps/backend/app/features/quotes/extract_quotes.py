# backend/app/features/technical/quote_extractor.py

import os
import json
from datetime import datetime
from fastapi import File, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.services import extract_document
from .quotes_config import QUOTE_EXTRACTOR_SYSTEM_PROMPT, LLAMA_QUOTE_EXTRACTOR_AGENT_NAME
from app.schemas.quote import Quote
from app.config import ai_config

DEBUG_MODE = ai_config.features.debug_mode

logger = get_logger(__name__)

def extract_quotes(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Extract structured quote data from a document file"""

    logger.info(f"📄 Received quote extraction request for: {file.filename}")
    
    result = extract_document(
        file=file, 
        agent_name=LLAMA_QUOTE_EXTRACTOR_AGENT_NAME,
        system_prompt=QUOTE_EXTRACTOR_SYSTEM_PROMPT,
        schema_class=Quote,
        log_label="Quote",
        )
    
    logger.info("✅ Quote extraction completed successfully")

    if DEBUG_MODE:
        # write result.data to file
        cache_dir = os.path.join(os.getcwd(), "mock_data", "quote_cache")
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f"{datetime.now().strftime('%Y-%m-%d_%H-%M')}.json")
        with open(cache_file, "w") as f:
            json.dump(result.data, f, indent=2, default=str)

    return ResponseEnvelope(
        data=result.data, 
        success=True, 
        message="Quote extraction completed successfully"
        )