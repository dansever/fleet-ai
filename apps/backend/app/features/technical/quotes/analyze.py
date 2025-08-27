from app.utils.logger import get_logger
from app.db.operations import get_quote_by_id
from app.core.ai.ai_client import extract_insights
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.utils import clean_records

logger = get_logger(__name__)

async def analyze_quotes(session: AsyncSession, quote_id: str) -> dict:
  logger.info(f"Analyzing quotes for quote: {quote_id}")
  db_quote = await get_quote_by_id(session=session, quote_id=quote_id)
  focus_fields = ["vendor_name", "part_number", "quantity", "price", "currency", "lead_time"]
  cleaned_quote = clean_records(db_quote, fields=focus_fields)
  print("cleaned_quote:", cleaned_quote)
  insights = await extract_insights(
    data=cleaned_quote, 
    data_type="quote", 
    focus_areas=["price", "delivery", "lead time", "quality", "service"])
  
  return {
    "quote_id": quote_id,
    "status": "analysis_complete",
    "message": "Quote analysis service is being implemented. This endpoint will provide comprehensive analysis of quotes for RFQs.",
    "insights": insights
  }
  