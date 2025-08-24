from fastapi import APIRouter, File, UploadFile, HTTPException
from app.features.fuel.fuel_bid_extractor import extract_fuel_bid
from app.shared.schemas.response import ResponseEnvelope
from app.utils import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/extract", response_model=ResponseEnvelope)
async def extract_fuel_bid_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured fuel bid data from an uploaded document.
    
    Accepts PDF and DOCX files and returns structured fuel bid information
    including supplier details, pricing, terms, and technical specifications.
    """
    try:
        logger.info(f"📄 Received fuel bid extraction request for file: {file.filename}")
        result = extract_fuel_bid(file)
        logger.info("✅ Fuel bid extraction completed successfully")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Unexpected error in fuel bid extraction endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error during fuel bid extraction"
        )
