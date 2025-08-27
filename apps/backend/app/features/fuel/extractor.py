# backend/app/features/fuel/fuel_bid_extractor.py

from fastapi import File, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.services import process_document_extraction
from .config import FUEL_BID_CONFIG
import os
import json

logger = get_logger(__name__)

def extract_fuel_bid(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Extract structured fuel bid data from a document file"""

    logger.info("🔍 Starting fuel bid extraction...")
    
    try:
        # run extraction once
        # result = process_document_extraction(file=file, **FUEL_BID_CONFIG)

        CACHE_FILE = os.path.join(os.getcwd(), "mock_data/fuel_bid_cache.json")

        # write result.data to file
        # with open(CACHE_FILE, "w") as f:
        #     json.dump(result.data, f, indent=2, default=str)

        # immediately read it back
        with open(CACHE_FILE, "r") as f:
            cached_data = json.load(f)

        # wrap back into ResponseEnvelope so the return type is the same
        return ResponseEnvelope(success=True, data=cached_data, message=None)


        return result
    except Exception as e:
        logger.exception(f"❌ Error in extract_fuel_bid_from_file: {str(e)}")
        raise