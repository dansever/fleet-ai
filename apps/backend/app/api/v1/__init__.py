"""
API v1 package for FleetAI backend.
Contains all v1 API endpoints and routing configuration.
"""

from .router import api_router
from .endpoints import quotes, llm, extract

__all__ = ["api_router" , "quotes", "llm", "extract"]
