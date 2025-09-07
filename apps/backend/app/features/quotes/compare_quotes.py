# backend/app/features/technical/quotes/compare_quotes.py

from app.utils.io.file_helpers import validate_file_type
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.operations import list_quotes_by_rfq
from app.ai.providers import OpenAIClient
import json
from decimal import Decimal
from datetime import date, datetime
from uuid import UUID as _UUID

from pydantic import BaseModel, ValidationError
from typing import Any
from app.shared.schemas import LLMMessage

class QuoteComparisonResult(BaseModel):
    comparison_analysis: str | None = None
    items: list[dict] | None = None
    winner: dict | None = None
    summary: str | None = None

async def compare_quotes(db: AsyncSession, rfq_id: UUID) -> QuoteComparisonResult:
    """
    Compare quotes for an RFQ and provide insights and recommendations.
    """
    quotes = await list_quotes_by_rfq(db.org_id, rfq_id)

    if not quotes:
        return QuoteComparisonResult(
            comparison_analysis="No quotes found for this RFQ.",
        )

    system_message = (
        "You are an expert quotes analyst. Be objective and conservative. "
        "If data is missing, use 'unknown'. Do not invent values. "
        "Return valid JSON matching QuoteComparisonResult."
        )

    user_prompt = (
        f"Compare the following quotes.\n"
        "- Score each criterion 0 to 10, higher is better\n"
        "- Winner must use a quote_id from quotes\n\n"
        f"Quotes JSON:\n{json.dumps(quotes, ensure_ascii=False)}"
    )

    try:
        client = OpenAIClient()
        message = [
            LLMMessage(role="system", content=system_message),
            LLMMessage(role="user", content=user_prompt),
        ]
        response = client.generate(
            messages=message,
        )
        return response

    except ValidationError as ve:
        return QuoteComparisonResult(
            comparison_analysis=f"Validation error: {ve}",
        )
    except Exception as e:
        return QuoteComparisonResult(
            comparison_analysis=f"AI analysis failed: {e}",
        )