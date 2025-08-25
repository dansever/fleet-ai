from fastapi import APIRouter, File, UploadFile, HTTPException
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.features.technical import extract_quote, extract_rfq

logger = get_logger(__name__)

router = APIRouter()

@router.post("/quotes/extract", response_model=ResponseEnvelope)
async def extract_quote_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured quote data from supplier response documents.
    
    Accepts PDF and DOCX files and returns structured quote information
    including parts, pricing, delivery terms, and supplier details.
    """
    try:
        logger.info(f"📄 Received quote extraction request for file: {file.filename}")
        result = extract_quote(file)
        logger.info("✅ Quote extraction completed successfully")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Unexpected error in quote extraction endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error during quote extraction"
        )


@router.post("/rfqs/extract", response_model=ResponseEnvelope)
async def extract_rfq_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured RFQ data from supplier response documents.
    
    Accepts PDF and DOCX files and returns structured RFQ information
    including parts, pricing, delivery terms, and supplier details.
    """
    try:
        logger.info(f"📄 Received RFQ extraction request for file: {file.filename}")
        result = extract_rfq(file)
        logger.info("✅ RFQ extraction completed successfully")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Unexpected error in RFQ extraction endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error during RFQ extraction"
        )