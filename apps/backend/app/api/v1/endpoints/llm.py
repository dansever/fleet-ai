from fastapi import APIRouter
from app.utils.logger import get_logger
from pydantic import BaseModel
from app.shared.schemas import ResponseEnvelope
from app.features.llm import basic_llm_call

logger = get_logger(__name__)

router = APIRouter(prefix="/llm", tags=["llm"])

class BasicLLMRequest(BaseModel):
    prompt: str 

# POST /api/v1/llm/basic - Basic LLM call
@router.post("/basic", response_model=ResponseEnvelope)
async def basic_llm_endpoint(request: BasicLLMRequest) -> ResponseEnvelope:
    """Basic LLM call with a simple text analysis."""
    result = await basic_llm_call(prompt=request.prompt)
    return ResponseEnvelope(
        data=result,
        success=result.success,
        message="LLM call completed"
    )