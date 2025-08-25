from fastapi import APIRouter
from app.api.v1.endpoints import fuel_extraction_router, technical_extraction_router, ground_services_extraction_router

api_router = APIRouter()

# ======= Fuel procurement extraction endpoints =======
# POST /api/v1/fuel/bids/extract - Extract fuel bids
# POST /api/v1/fuel/contracts/extract - Extract fuel contracts
# POST /api/v1/fuel/tender/extract - Extract fuel tender
api_router.include_router(
    fuel_extraction_router,
    prefix="/fuel",
    tags=["fuel-extraction"]
)

# ======= Technical procurement extraction endpoints =======
# POST /api/v1/technical/quotes/extract - Extract technical quotes
# POST /api/v1/technical/rfqs/extract - Extract technical RFQs
# POST /api/v1/technical/parts/extract - Extract technical parts
api_router.include_router(
    technical_extraction_router,
    prefix="/technical",
    tags=["technical-extraction"]
)

# ======= Ground services extraction endpoints =======
# POST /api/v1/ground-services/contracts/extract - Extract ground services contracts
api_router.include_router(
    ground_services_extraction_router,
    prefix="/ground-services",
    tags=["ground-services-extraction"]
)