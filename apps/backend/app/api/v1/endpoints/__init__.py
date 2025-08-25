# API endpoints package
from .fuel_extraction import router as fuel_extraction_router
from .technical_extraction import router as technical_extraction_router
from .ground_services_extraction import router as ground_services_extraction_router

__all__ = [
  "fuel_extraction_router", 
  "technical_extraction_router", 
  "ground_services_extraction_router"
]