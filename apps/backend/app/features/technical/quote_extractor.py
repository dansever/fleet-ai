# backend/app/features/technical/quote_extractor.py

from fastapi import File, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.services import process_document_extraction
from .config import QUOTE_CONFIG
import os
import json
from datetime import datetime

logger = get_logger(__name__)

def extract_quote(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Extract structured quote data from a document file"""

    logger.info(f"📄 Received quote extraction request for file: {file.filename}")
        
    try:
        # run extraction once
        result = process_document_extraction(file=file, **QUOTE_CONFIG)

        CACHE_FILE = os.path.join(os.getcwd(), f"mock_data/quote_cache/{datetime.now().strftime('%Y-%m-%d_%H-%M')}.json")

        # write result.data to file
        with open(CACHE_FILE, "w") as f:
            json.dump(result.data, f, indent=2, default=str)

        # immediately read it back
        with open(CACHE_FILE, "r") as f:
            cached_data = json.load(f)
        
        logger.info("✅ Quote extraction completed successfully")

        # wrap back into ResponseEnvelope so the return type is the same
        return ResponseEnvelope(success=True, data=cached_data, message=None)

    except Exception as e:
        logger.exception(f"❌ Error in extract_quote_from_file: {str(e)}")
        raise