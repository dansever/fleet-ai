from fastapi import APIRouter, HTTPException
from app.shared.schemas import ResponseEnvelope
from app.utils.logger import get_logger
from app.config import AIConfig
from pydantic import BaseModel, Field
from app.shared.schemas.response import Meta, ResponseEnvelope
from app.services.ai import get_openai_client, ModelProvider

logger = get_logger(__name__)

router = APIRouter(prefix="/llm", tags=["llm"])

class PromptRequest(BaseModel):
    prompt: str

class PromptResponse(BaseModel):
    formal: str = Field(..., description="The formal response from the LLM")
    non_formal: str = Field(..., description="The non-formal response from the LLM")

# POST /api/v1/llm/test - Test LLM functionality
@router.post("/test", response_model=ResponseEnvelope)
async def llm_test(req: PromptRequest) -> ResponseEnvelope:
    """
    Test LLM functionality with a simple text analysis.
    
    Accepts text input and returns AI analysis results.
    """
    try:
        prompt = req.prompt

        client = get_openai_client()

        instructions="You are a helpful assistant that answers questions gracefully. Return the response in a formal and non-formal way according to the text format schema."

        result = client.generate(
            prompt=prompt,
            response_schema=PromptResponse,
            system_message=instructions,
        )

        return ResponseEnvelope(
            success=True,
            message="LLM test completed successfully",
            data=result.content,
            meta=Meta(
                model=result.model,
                usage={
                    "input_tokens": result.usage.input_tokens,
                    "output_tokens": result.usage.output_tokens,
                    "total_tokens": result.usage.total_tokens,
                },
            )
        )
    
    except Exception as e:
        logger.exception(f"❌ LLM test error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during LLM test"
        )
    