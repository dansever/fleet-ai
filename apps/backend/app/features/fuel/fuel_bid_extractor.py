# backend/app/features/fuel/fuel_bid_extractor.py

from fastapi import File, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.services import process_document_extraction
from .fuel_config import FUEL_BID_EXTRACTOR_CONFIG
import os
import json
from app.config import ai_config
from datetime import datetime

DEBUG_MODE = ai_config.features.debug_mode

logger = get_logger(__name__)


def extract_fuel_bid(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Extract structured fuel bid data from a document file"""

    logger.info(f"📄 Received fuel bid extraction request for: {file.filename}")

    result = process_document_extraction(file=file, **FUEL_BID_EXTRACTOR_CONFIG)

    logger.info("✅ Fuel bid extraction completed successfully")

    if DEBUG_MODE:
        # write result.data to file
        cache_dir = os.path.join(os.getcwd(), "mock_data", "fuel_bid_cache")
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f"{datetime.now().strftime('%Y-%m-%d_%H-%M')}.json")
        with open(cache_file, "w") as f:
            json.dump(result.data, f, indent=2, default=str)

    return ResponseEnvelope(data=result.data, success=True, message="Fuel bid extraction completed successfully")
