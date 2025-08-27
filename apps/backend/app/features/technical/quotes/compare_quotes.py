from app.db.utils import clean_records
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.operations import get_quotes_by_rfq_id
from app.shared.schemas import ResponseEnvelope
from app.services.ai import get_openai_client
import json

from decimal import Decimal
from datetime import date, datetime
from uuid import UUID as _UUID  

from pydantic import BaseModel, Field
from typing import Annotated

class QuoteComparisonResult(BaseModel):
  comparison_analysis: str | None = None
  items: list[dict] | None = None
  winner: dict | None = None
  summary: str | None = None

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

# ---------- Quote comparison ----------

async def compare_quotes(db: AsyncSession, rfq_id: UUID) -> QuoteComparisonResult:
  """
  Compare quotes for an RFQ and provide insights and recommendations.
  """
  quotes = await get_quotes_by_rfq_id(db, rfq_id)
  if not quotes:
    # Return a default result when no quotes are found
    return QuoteComparisonResult(
      comparison_analysis="No quotes found for this RFQ.",
      items=[],
      winner={"quote_id": "none", "reason": "No quotes available", "confidence": 0},
      summary="No quotes were found for the specified RFQ."
    )
    
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
      items_for_model.append(sanitize_obj(item))

  # Criteria names match scorecard keys
  criteria = ["price", "delivery", "lead_time", "quality", "service"]

  # Direct schema instruction that matches QuoteComparisonResult exactly
  schema_text = f"""
Analyze the quotes and return a JSON object with this EXACT structure:

{{
  "comparison_analysis": "Detailed analysis comparing the quotes across {', '.join(criteria)} criteria",
  "items": [
    {{
      "quote_id": "string from the quote data",
      "strengths": ["list of key strengths"],
      "weaknesses": ["list of key weaknesses"], 
      "scorecard": {{
        "price": number_0_to_10,
        "delivery": number_0_to_10,
        "lead_time": number_0_to_10,
        "quality": number_0_to_10,
        "service": number_0_to_10,
        "total": sum_of_all_scores
      }}
    }}
  ],
  "winner": {{
    "quote_id": "must match one of the items quote_id values",
    "reason": "clear explanation of why this quote won",
    "confidence": number_0_to_10
  }},
  "summary": "concise summary of the comparison and recommendation"
}}

Rules:
- All scorecard numbers must be 0-10, higher is better
- total must equal sum of price + delivery + lead_time + quality + service
- winner.quote_id must exactly match one of the items[].quote_id values
- Return ONLY valid JSON, no markdown or commentary
"""

  quotes_json = json.dumps(items_for_model, ensure_ascii=False)

  prompt = (
      "Compare the following quotes and produce a structured analysis.\n\n"
      f"Criteria to compare: {', '.join(criteria)}\n\n"
      f"Quotes data:\n{quotes_json}\n\n"
      f"{schema_text}"
  )

  system_message = (
      "You are an expert quotes analyst. Analyze objectively and return exactly the requested JSON structure. "
      "If data is missing, use 'unknown'. Do not invent values. Ensure all required fields are present."
  )

  try:
      # Initialize AI client using centralized function
      ai_client = get_openai_client()
      
      # Use the new AI client structure
      result = ai_client.generate(
          prompt=prompt,
          system=system_message,
          temperature=0.3
      )
      return result
      
  except Exception as e:
      # Fallback for any AI processing error
      return QuoteComparisonResult(
          comparison_analysis=f"AI analysis failed: {str(e)}",
          items=[],
          winner={"quote_id": "error", "reason": "AI processing error", "confidence": 0},
          summary=f"Error during AI analysis: {str(e)}"
      )