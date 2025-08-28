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
    result = await extract_quote(file)
    return ResponseEnvelope(
        data=result.data,
        success=result.success,
        message="Quote extraction task completed"
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
    result = await extract_rfq(file)
    return ResponseEnvelope(
        data=result.data,
        success=result.success,
        message="RFQ extraction task completed"
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
    result = await extract_fuel_bid(file)
    return ResponseEnvelope(
        data=result.data,
        success=result.success,
        message="Fuel bid extraction task completed"
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
    # TODO: Implement when ground services extractor is ready
    raise HTTPException(status_code=501, detail="Service contract extraction not yet implemented")
