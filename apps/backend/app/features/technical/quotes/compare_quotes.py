from app.core.ai.ai_client import compare_items, get_ai_client
from app.db.utils import clean_records
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.operations import get_quotes_by_rfq_id
from app.shared.schemas import ResponseEnvelope
import json

from decimal import Decimal
from datetime import date, datetime
from uuid import UUID as _UUID  

from pydantic import BaseModel, Field
from typing import Annotated

class ComparisonResult(BaseModel):
  comparison_analysis: str
  items: list[dict]
  winner: dict
  summary: str

# ---------- JSON sanitizers ----------
def to_jsonable(value):
    if isinstance(value, Decimal):
        return float(value)  # or str(value) if you prefer exactness
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, (_UUID, UUID)):
        return str(value)
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value

def sanitize_obj(obj):
    if isinstance(obj, dict):
        return {k: sanitize_obj(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_obj(v) for v in obj]
    return to_jsonable(obj)


async def compare_quotes(db: AsyncSession, rfq_id: UUID) -> dict:
  """
  Compare quotes for an RFQ and provide insights and recommendations.
  """
  quotes = await get_quotes_by_rfq_id(db, rfq_id)
  if not quotes:
    return ResponseEnvelope(success=True, data={"analysis": "No quotes found for this RFQ."})
    
  focus_fields = ["rfq_number", "vendor_name", "part_number", "serial_number", "part_description", "condition_code",
  "unit_of_measure", "quantity", "price", "currency", "pricing_type", "pricing_method", "core_due", "core_change",
  "payment_terms", "minimum_order_quantity", "lead_time", "delivery_terms", "warranty", "quote_expiration_date",
  "certifications", "trace_to", "tag_type", "tagged_by", "tagged_date", "vendor_comments"
  ]
  cleaned_quotes = clean_records(quotes, fields=focus_fields)

  # Ensure each item has a stable identifier
  def make_quote_id(q, idx):
      return str(q.get("id")) if q.get("id") else f"idx_{idx+1}_{q.get('vendor_name','unknown')}_{q.get('part_number','na')}"

  items_for_model = []
  for i, q in enumerate(cleaned_quotes):
      item = {
          "quote_id": make_quote_id(q, i),
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
      items_for_model.append(sanitize_obj(item))  # append inside loop

  # Criteria names match scorecard keys
  criteria = ["price", "delivery", "lead_time", "quality", "service"]

  # Strict JSON schema instruction
  schema_text = """
Return ONLY a single JSON object with this exact structure:

{
"comparison_analysis": "string",
"items": [
  {
    "quote_id": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "scorecard": {
      "price": number,
      "delivery": number,
      "lead_time": number,
      "quality": number,
      "service": number,
      "total": number
    }
  }
],
"winner": {
  "quote_id": "string",
  "reason": "string",
  "confidence": number
},
"summary": "string"
}

Rules:
- Use numbers between 0 and 10 for all scorecard fields. Higher is better.
- total must equal the sum of the numeric criteria fields.
- winner.quote_id must match one of the items[].quote_id.
- Output JSON only, no markdown, no commentary.
"""

  quotes_json = json.dumps(items_for_model, ensure_ascii=False)  # already sanitized

  prompt = (
      "Compare the following quotes and produce a structured result for easy parsing.\n\n"
      f"Criteria to compare: {', '.join(criteria)}\n\n"
      f"Quotes JSON:\n{quotes_json}\n\n"
      f"{schema_text}"
  )

  system_message = (
      "You are an expert quotes analyst. Be precise and objective. "
      "If data is missing, say 'unknown'. Do not invent values."
  )

  ai_client = get_ai_client()
  result_text = await ai_client.generate_response(
      prompt,
      system_message,
      response_format="json"  # enable if your provider supports strict JSON mode
  )

  # Parse and return strict JSON. Fall back to envelope if not JSON.
  try:
      parsed = json.loads(result_text)
      return parsed
  except Exception:
      return ResponseEnvelope(success=True, data={"raw": result_text})