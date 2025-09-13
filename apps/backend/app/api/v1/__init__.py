"""
API v1 package for FleetAI backend.
Contains all v1 API endpoints and routing configuration.
"""

from .router import api_router
from .endpoints import admin_router

__all__ = ["api_router" , "admin_router"]
