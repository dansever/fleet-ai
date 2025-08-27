from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.schemas import ResponseEnvelope
from app.utils.logger import get_logger
from app.features.technical.quotes import compare_quotes
from app.db.session import get_db

logger = get_logger(__name__)

router = APIRouter(prefix="/quotes", tags=["quotes"])

# POST /api/v1/quotes/compare - Compare quotes
@router.post("/compare", response_model=ResponseEnvelope)
async def compare_quotes_endpoint(
    rfqId: UUID = Query(..., description="RFQ ID to compare quotes for"),
    db: AsyncSession = Depends(get_db)
) -> ResponseEnvelope:
    """
    Compare quotes and provide insights and recommendations.
    """
    result = await compare_quotes(db,rfqId)
    return ResponseEnvelope(
        data=result,
        success=True,
        message="Quotes compared successfully",
        )