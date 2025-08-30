"""
Features package for FleetAI backend.
Contains business logic for different application features.
"""

from .fuel import extract_fuel_bid
from .quotes import extract_quotes, compare_quotes
from .rfqs import extract_rfq

__all__ = [
    # Fuel features
    "extract_fuel_bid",
    # Quotes features
    "extract_quotes",
    "compare_quotes",
    # RFQs features
    "extract_rfq"
]
