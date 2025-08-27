from fastapi import APIRouter, HTTPException, Query
from app.shared.schemas import ResponseEnvelope
from app.utils.logger import get_logger
from app.core.ai.ai_client import llm_query

logger = get_logger(__name__)

router = APIRouter(prefix="/llm", tags=["llm"])

# POST /api/v1/llm/test - Test LLM functionality
@router.post("/test", response_model=ResponseEnvelope)
async def llm_test(
    prompt: str = Query(..., description="Prompt to analyze")
) -> ResponseEnvelope:
    """
    Test LLM functionality with a simple text analysis.
    
    Accepts text input and returns AI analysis results.
    """
    try:
        logger.info(f"🧠 Received LLM test request for prompt: {prompt[:50]}...")
        
        result = await llm_query(
            prompt=prompt
        )
        
        logger.info("✅ LLM test completed successfully")
        
        return ResponseEnvelope(
            success=True,
            message="LLM test completed successfully",
            data={"analysis": result}
        )
        
    except Exception as e:
        logger.exception(f"❌ LLM test error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during LLM test"
        )





