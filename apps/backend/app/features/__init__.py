"""
Features package for FleetAI backend.
Contains business logic for different application features.
"""

from .fuel import extract_fuel_bid, FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME, FUEL_BID_EXTRACTOR_SYSTEM_PROMPT
from .technical import extract_quote, extract_rfq

__all__ = [
    # Fuel features
    "extract_fuel_bid",
    "FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME", 
    "FUEL_BID_EXTRACTOR_SYSTEM_PROMPT",
    # Technical features
    "extract_quote",
    "extract_rfq"
]
