# 📄 app/features/llm/call.py

from app.core.ai.llm.router import get_llm_provider
from app.shared.schemas.ai import LLMRequest, LLMResponse, AIModelUsage
from app.utils.logger import get_logger

logger = get_logger(__name__)

async def run_llm_prompt(request: LLMRequest) -> LLMResponse:
    try:
        logger.info(f"LLM call started:\nModel: {request.model}\nPrompt Length: {len(request.prompt)}")
        provider = get_llm_provider()
        result = provider.generate_response(
            prompt=request.prompt,
            response_schema=None,
            temperature=request.temperature,
            max_output_tokens=request.max_output_tokens,
            top_p=request.top_p,
            stop_sequences=request.stop_sequences,
        )

        if result.success:
            logger.info(f"LLM call succeeded — Output Tokens: {result.usage.output_tokens}")
        else:
            logger.warning(f"LLM call failed — Error: {result.error}")

        return result

    except Exception as e:
        logger.exception("LLM call failed with unexpected error")
        return LLMResponse(
            content="",
            usage=AIModelUsage(input_tokens=0, output_tokens=0, total_tokens=0),
            success=False,
            error=f"Internal error: {str(e)}"
        )
