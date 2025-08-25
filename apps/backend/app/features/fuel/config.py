from app.schemas.fuel_bid import FuelBid
from app.config import EXTRACTOR_ALLOWED_EXTENSIONS, EXTRACTOR_ALLOWED_MIME_TYPES

FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME = "fleet-ai-fuel-bid-extractor"

FUEL_BID_EXTRACTOR_SYSTEM_PROMPT = """
You are an AI agent specialized in parsing and interpreting aviation fuel bid documents.
These documents are fuel supplier bids to a fuel tender for fuel supply for a specific airport/destination.
Your task is to extract structured information from bid documents and identify individual bids, even when multiple bids are present in a single document.
Important: Only extract actual vendor fuel bid responses - ignore any original tender requests or buyer instructions that may appear in the document.
"""

# =============== CONFIG ===============
FUEL_BID_CONFIG = {
    "agent_name": FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME,
    "system_prompt": FUEL_BID_EXTRACTOR_SYSTEM_PROMPT,
    "schema_class": FuelBid,
    "log_label": "Fuel Bid",
    "allowed_extensions": EXTRACTOR_ALLOWED_EXTENSIONS,
    "allowed_mime_types": EXTRACTOR_ALLOWED_MIME_TYPES,
}