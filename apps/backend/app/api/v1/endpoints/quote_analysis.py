from fastapi import APIRouter, HTTPException, Query
from app.services.quote_analysis_service import QuoteAnalysisService
from app.shared.schemas import ResponseEnvelope
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/quotes/analyze", response_model=ResponseEnvelope)
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
        logger.info(f"🔍 Received quote analysis request for RFQ: {rfqId}")
        
        # Initialize analysis service
        analysis_service = QuoteAnalysisService()
        
        # Perform analysis
        analysis_result = await analysis_service.analyze_quotes_for_rfq(rfqId)
        
        logger.info(f"✅ Quote analysis completed for RFQ: {rfqId}")
        
        # Return structured response
        return ResponseEnvelope(
            success=True,
            message=f"Successfully analyzed quotes for RFQ {rfqId}",
            data=analysis_result
        )
        
    except ValueError as e:
        logger.warning(f"⚠️ Invalid request for quote analysis: {str(e)}")
        raise HTTPException(
            status_code=404,
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