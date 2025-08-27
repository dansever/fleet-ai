from app.db.utils import clean_records
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.operations import get_quotes_by_rfq_id
from app.services.ai import get_openai_client
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

# ---------- JSON sanitizers ----------
def to_jsonable(value: Any):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, (_UUID, UUID)):
        return str(value)
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value

def sanitize_obj(obj: Any):
    if isinstance(obj, dict):
        return {k: sanitize_obj(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_obj(v) for v in obj]
    return to_jsonable(obj)

# ---------- Quote comparison ----------

CRITERIA = ["price", "delivery", "lead_time", "quality", "service", "total"]

FOCUS_FIELDS = [
    "id", "rfq_number", "vendor_name", "part_number", "serial_number", "part_description",
    "condition_code", "unit_of_measure", "quantity", "price", "currency", "pricing_type",
    "pricing_method", "core_due", "core_change", "payment_terms", "minimum_order_quantity",
    "lead_time", "delivery_terms", "warranty", "quote_expiration_date", "certifications",
    "trace_to", "tag_type", "tagged_by", "tagged_date", "vendor_comments"
]



def _build_items_for_model(cleaned_quotes: list[dict]) -> list[dict]:
    items = []
    for i, q in enumerate(cleaned_quotes):
        item = {
            "quote_id": q.get("id"),
            "vendor_name": q.get("vendor_name"),
            "part_number": q.get("part_number"),
            "serial_number": q.get("serial_number"),
            "part_description": q.get("part_description"),
            "condition_code": q.get("condition_code"),
            "unit_of_measure": q.get("unit_of_measure"),
            "quantity": q.get("quantity"),
            "price": q.get("price"),
            "currency": q.get("currency"),
            "pricing_type": q.get("pricing_type"),
            "pricing_method": q.get("pricing_method"),
            "core_due": q.get("core_due"),
            "core_change": q.get("core_change"),
            "payment_terms": q.get("payment_terms"),
            "minimum_order_quantity": q.get("minimum_order_quantity"),
            "lead_time": q.get("lead_time"),
            "delivery_terms": q.get("delivery_terms"),
            "warranty": q.get("warranty"),
            "quote_expiration_date": q.get("quote_expiration_date"),
            "certifications": q.get("certifications"),
            "trace_to": q.get("trace_to"),
            "tag_type": q.get("tag_type"),
            "tagged_by": q.get("tagged_by"),
            "tagged_date": q.get("tagged_date"),
            "vendor_comments": q.get("vendor_comments"),
        }
        items.append(sanitize_obj(item))
    return items

def _default_empty_result(msg: str) -> QuoteComparisonResult:
    return QuoteComparisonResult(
        comparison_analysis=msg,
        items=[],
        winner={"quote_id": "none", "reason": msg, "confidence": 0},
        summary=msg,
    )

def _postprocess_result(parsed: QuoteComparisonResult) -> QuoteComparisonResult:
    # Ensure winner.quote_id exists in items
    item_ids = {i.get("quote_id") for i in (parsed.items or []) if isinstance(i, dict)}
    if parsed.winner and isinstance(parsed.winner, dict):
        w_id = parsed.winner.get("quote_id")
        if w_id not in item_ids:
            parsed.winner = {
                "quote_id": next(iter(item_ids), "none"),
                "reason": "Adjusted to match available items",
                "confidence": 0
            }

    # Fix totals if needed
    fixed_items = []
    for i in parsed.items or []:
        sc = i.get("scorecard", {})
        keys = ["price", "delivery", "lead_time", "quality", "service", "total"]
        if all(k in sc for k in keys):
            try:
                computed = float(sc["price"]) + float(sc["delivery"]) + float(sc["lead_time"]) + float(sc["quality"]) + float(sc["service"])
                if abs(float(sc["total"]) - computed) > 1e-6:
                    sc["total"] = computed
            except Exception:
                pass
        fixed_items.append(i)
    parsed.items = fixed_items
    return parsed

async def compare_quotes(db: AsyncSession, rfq_id: UUID) -> QuoteComparisonResult:
    """
    Compare quotes for an RFQ and provide insights and recommendations.
    """
    quotes = await get_quotes_by_rfq_id(db, rfq_id)

    if not quotes:
        return _default_empty_result("No quotes found for this RFQ.")

    cleaned_quotes = clean_records(quotes, fields=FOCUS_FIELDS)
    items_for_model = _build_items_for_model(cleaned_quotes)

    system_message = (
        "You are an expert quotes analyst. Be objective and conservative. "
        "If data is missing, use 'unknown'. Do not invent values. "
        "Return valid JSON matching QuoteComparisonResult."
    )

    user_prompt = (
        f"Compare the following quotes across these criteria: {', '.join(CRITERIA)}.\n"
        "- Score each criterion 0 to 10, higher is better\n"
        "- total = price + delivery + lead_time + quality + service\n"
        "- Winner must use a quote_id from items\n\n"
        f"Quotes JSON:\n{json.dumps(items_for_model, ensure_ascii=False)}"
    )

    try:
        ai_client = get_openai_client()
        message = [
            LLMMessage(role="system", content=system_message),
            LLMMessage(role="user", content=user_prompt),
        ]
        response = ai_client.generate(
            messages=message,
        )
        return response

    except ValidationError as ve:
        return _default_empty_result(f"Validation error: {ve}")
    except Exception as e:
        return _default_empty_result(f"AI analysis failed: {e}")