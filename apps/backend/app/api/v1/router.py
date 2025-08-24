from fastapi import APIRouter
from app.api.v1.endpoints import fuel_bids

api_router = APIRouter()

# Include feature-specific routers
api_router.include_router(
    fuel_bids.router,
    prefix="/fuel-bids",
    tags=["fuel-bids"]
)
