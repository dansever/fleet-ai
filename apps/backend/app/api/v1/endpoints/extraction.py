from fastapi import APIRouter, File, UploadFile, HTTPException
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.features.technical import extract_quote, extract_rfq
from app.features.fuel import extract_fuel_bid

logger = get_logger(__name__)

router = APIRouter(prefix="/extract", tags=["extraction"])

# POST /api/v1/extract/quotes - Extract quotes
@router.post("/quote", response_model=ResponseEnvelope)
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


@router.post("/rfq", response_model=ResponseEnvelope)
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

@router.post("/fuel/bid", response_model=ResponseEnvelope)
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

@router.post("/fuel/contract", response_model=ResponseEnvelope)
async def extract_fuel_contract_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured fuel contract data from agreement documents.
    
    Accepts PDF and DOCX files and returns structured fuel contract information
    including supplier details, pricing, terms, and technical specifications.
    """
    # TODO: Implement when fuel contract extractor is ready
    raise HTTPException(status_code=501, detail="Fuel contract extraction not yet implemented")


@router.post("/service-contract", response_model=ResponseEnvelope)
async def extract_service_contract_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured service contract data from ground services agreements.
    
    Accepts PDF and DOCX files and returns structured contract information
    including services, rates, terms, and provider details.
    """
    try:
        logger.info(f"📄 Received service contract extraction request for file: {file.filename}")
        # TODO: Implement when ground services extractor is ready
        raise HTTPException(status_code=501, detail="Service contract extraction not yet implemented")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Unexpected error in service contract extraction endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error during service contract extraction"
        )
