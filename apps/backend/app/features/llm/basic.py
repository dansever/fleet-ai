# 📄 app/features/llm/call.py

from app.shared.schemas import LLMParams, LLMResponse
from app.utils.logger import get_logger
from app.services.ai import get_openai_client

logger = get_logger(__name__)

async def basic_llm_call(prompt: str) -> LLMResponse:
    try:
        # Initialize client
        client = get_openai_client()
        system_prompt="You are an AI Assistant for an AI SaaS for airline procurement teams. Please answer shortly and concisely any question you are asked."

        # Generate response
        response = client.generate(
            prompt=prompt,
            system=system_prompt,
        )

        return response
        
    except Exception as e:
        logger.exception("LLM call failed with unexpected error")
        raise e
