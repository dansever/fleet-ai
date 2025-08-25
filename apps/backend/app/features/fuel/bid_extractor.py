# backend/app/features/fuel/fuel_bid_extractor.py

from fastapi import File, UploadFile
from app.shared.schemas.response import ResponseEnvelope
from app.utils import get_logger
from app.services.document_extraction_service import process_document_extraction
from app.schemas.fuel_bid import FuelBid
from .config import FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME

logger = get_logger(__name__)

def extract_fuel_bid(file: UploadFile = File(...)) -> ResponseEnvelope:
    """Extract structured fuel bid data from a document file"""
    
    ALLOWED_EXTENSIONS = (".pdf", ".docx")
    ALLOWED_MIME_TYPES = ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

    FUEL_BID_EXTRACTOR_SYSTEM_PROMPT = """
    You are an AI agent specialized in parsing and interpreting aviation fuel bid documents.
    These documents are fuel supplier bids to a fuel tender for fuel supply for a specific airport/destination.
    Your task is to extract structured information from bid documents and identify individual bids, even when multiple bids are present in a single document.
    Important: Only extract actual vendor fuel bid responses - ignore any original tender requests or buyer instructions that may appear in the document.
        """

    logger.info("🔍 Starting fuel bid extraction...")

    try:
        result = process_document_extraction(
            file=file,
            agent_name=FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME,
            system_prompt=FUEL_BID_EXTRACTOR_SYSTEM_PROMPT,
            schema_class=FuelBid,
            log_label="Fuel Bid",
            allowed_extensions=ALLOWED_EXTENSIONS,
            allowed_mime_types=ALLOWED_MIME_TYPES
        )

        return result

    except Exception as e:
        logger.exception(f"❌ Error in extract_fuel_bid_from_file: {str(e)}")
        raise