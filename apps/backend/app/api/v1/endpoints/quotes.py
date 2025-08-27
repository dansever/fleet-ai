from fastapi import APIRouter, HTTPException, Query
from app.shared.schemas import ResponseEnvelope
from app.utils.logger import get_logger
from app.features.technical.quotes import analyze_quotes

logger = get_logger(__name__)

router = APIRouter(prefix="/quotes", tags=["quotes"])

# POST /api/v1/quotes/analyze - Analyze quotes for RFQ
@router.post("/analyze", response_model=ResponseEnvelope)
async def analyze_quotes_for_rfq(
    rfqId: str = Query(..., description="RFQ ID to analyze quotes for")
) -> ResponseEnvelope:
    """
    Analyze all quotes for a given RFQ and provide insights and recommendations.
    
    This endpoint fetches all quotes associated with the specified RFQ ID,
    analyzes them using AI, and provides detailed insights including:
    - Price analysis and comparisons
    - Vendor evaluation
    - Technical compliance assessment
    - Commercial terms analysis
    - Risk assessment
    - Recommendation for quote selection
    """
    try:
        analysis_result = await analyze_quotes(rfq_id=rfqId)

        # Return structured response
        return ResponseEnvelope(
            success=True,
            message=f"Quote analysis request received for RFQ {rfqId}. Service implementation in progress.",
            data=analysis_result
        )
        
    except ValueError as e:
        logger.warning(f"⚠️ Invalid request for quote analysis: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Unexpected error in quote analysis endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during quote analysis"
        )