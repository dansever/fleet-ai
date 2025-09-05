# backend/app/api/v1/endpoints/extract.py

from fastapi import APIRouter, File, UploadFile, HTTPException
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.features.quotes import extract_quotes
from app.features.rfqs import extract_rfq
from app.features.fuel import extract_fuel_bid

logger = get_logger(__name__)

router = APIRouter(
    prefix="/extract",
    tags=["extraction"],
    responses={
        415: {"description": "Unsupported media type"},
        413: {"description": "File too large"},
        422: {"description": "Validation error"},
    },
)

# POST /api/v1/extract/quotes - Extract quotes
@router.post("/quotes", response_model=ResponseEnvelope)
async def extract_quotes_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured quote data from supplier response documents.
    """
    return extract_quotes(file)

@router.post("/rfq", response_model=ResponseEnvelope)
async def extract_rfq_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured RFQ data from supplier response documents.
    """
    return extract_rfq(file)
    

@router.post("/fuel/bid", response_model=ResponseEnvelope)
async def extract_fuel_bid_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured fuel bid data from an uploaded document.
    """
    return extract_fuel_bid(file)
   

@router.post("/fuel/contract", response_model=ResponseEnvelope, include_in_schema=False)
async def extract_fuel_contract_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured fuel contract data from agreement documents.
    """
    # TODO: Implement when fuel contract extractor is ready
    raise HTTPException(status_code=501, detail="Fuel contract extraction not yet implemented")


@router.post("/contract", response_model=ResponseEnvelope, include_in_schema=False)
async def extract_contract_from_document(
    file: UploadFile = File(...)
) -> ResponseEnvelope:
    """
    Extract structured service contract data from ground services agreements.
    """
    # TODO: Implement when ground services extractor is ready
    raise HTTPException(status_code=501, detail="Service contract extraction not yet implemented")
