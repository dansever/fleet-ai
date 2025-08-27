from app.schemas import RFQ, Quote
from app.config import ai_config


# ============================== RFQ ==============================
RFQ_EXTRACTOR_SYSTEM_PROMPT = """
    You are an AI agent specialized in parsing and interpreting aviation RFQ (Request for Quote) documents.
    These documents are submitted by airlines or MRO teams requesting price and availability information from vendors for specific aircraft parts or services.
    Your task is to extract structured information from the RFQ document and present a clear summary of what the buyer is asking for.
    """

RFQ_LLAMA_EXTRACTOR_AGENT_NAME = "fleet-ai-rfq-extractor"

RFQ_CONFIG = {
    "agent_name": RFQ_LLAMA_EXTRACTOR_AGENT_NAME,
    "system_prompt": RFQ_EXTRACTOR_SYSTEM_PROMPT,
    "schema_class": RFQ,
    "log_label": "RFQ",
    "allowed_extensions": ai_config.allowed_extensions,
    "allowed_mime_types": ai_config.allowed_mime_types,
}

# ============================== QUOTE ==============================
QUOTE_EXTRACTOR_SYSTEM_PROMPT = """
    You are an AI agent specialized in parsing and interpreting aviation quote documents.
    These documents are vendor responses to RFQ (Request for Quote) submissions, containing detailed pricing, availability, and specification information for aircraft parts or services.
    Your task is to extract structured information from quote documents and identify individual quotes, even when multiple quotes are present in a single document.
    Important: Only extract actual vendor quote responses - ignore any original RFQ requests or buyer instructions that may appear in the document.
    """

QUOTE_LLAMA_EXTRACTOR_AGENT_NAME = "fleet-ai-quote-extractor"

QUOTE_CONFIG = {
    "agent_name": QUOTE_LLAMA_EXTRACTOR_AGENT_NAME,
    "system_prompt": QUOTE_EXTRACTOR_SYSTEM_PROMPT,
    "schema_class": Quote,
    "log_label": "Quote",
    "allowed_extensions": ai_config.allowed_extensions,
    "allowed_mime_types": ai_config.allowed_mime_types,
}

