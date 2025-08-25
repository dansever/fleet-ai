# backend/app/features/fuel/fuel_bid_extractor.py

from fastapi import File, UploadFile
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.services.document_extraction_service import process_document_extraction
from .config import FUEL_BID_CONFIG

logger = get_logger(__name__)

def extract_fuel_bid(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Extract structured fuel bid data from a document file"""

    logger.info("🔍 Starting fuel bid extraction...")
    try:
        result = process_document_extraction(file=file,**FUEL_BID_CONFIG)
        return result
    except Exception as e:
        logger.exception(f"❌ Error in extract_fuel_bid_from_file: {str(e)}")
        raise