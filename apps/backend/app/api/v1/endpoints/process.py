# backend/app/api/v1/endpoints/process.py

import os
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.core import require_auth
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.features.contract import process_contract

logger = get_logger(__name__)

router = APIRouter(
    prefix="/process",
    tags=["process"],
    responses={
        415: {"description": "Unsupported media type"},
        413: {"description": "File too large"},
        422: {"description": "Validation error"},
    },
)

# POST /api/v1/process/contracts - Process contracts
@router.post("/contracts", response_model=ResponseEnvelope)
async def process_contract_from_file(
    file: UploadFile = File(...),
    auth = Depends(require_auth),
) -> ResponseEnvelope:
    """
    Process contracts from a file.
    """
    # print("org_id", auth["org_id"])
    # return process_contract(file, org_id=auth["org_id"])
    return ResponseEnvelope(
        data=None,
        success=True,
        message="Test"
    )