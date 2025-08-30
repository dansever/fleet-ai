# backend/app/features/quotes/quotes_config.py

from app.schemas.quote import Quote
from app.config import ai_config

# ============================== QUOTE Extractor ==============================
QUOTE_EXTRACTOR_SYSTEM_PROMPT = """
    You are an AI agent specialized in parsing and interpreting aviation quote documents.
    These documents are vendor responses to RFQ (Request for Quote) submissions, containing detailed pricing, availability, and specification information for aircraft parts or services.
    Your task is to extract structured information from quote documents and identify individual quotes, even when multiple quotes are present in a single document.
    Important: Only extract actual vendor quote responses - ignore any original RFQ requests or buyer instructions that may appear in the document.
    """

LLAMA_QUOTE_EXTRACTOR_AGENT_NAME = "fleet-ai-quote-extractor"
