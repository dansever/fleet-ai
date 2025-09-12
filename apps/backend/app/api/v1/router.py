from fastapi import APIRouter
from app.api.v1.endpoints import extract_router, quotes_router, llm_router, process_router, admin_router

api_router = APIRouter()

# ======= Document extraction endpoints =======
# POST /api/v1/extract/quotes - Extract quotes
# POST /api/v1/extraction/extract/rfqs - Extract RFQs  
# POST /api/v1/extract/fuel/bids - Extract fuel bids
api_router.include_router(
    extract_router,
    tags=["extraction"]
)

# ======= Process endpoints =======
# POST /api/v1/process/contracts - Process contracts
api_router.include_router(
    process_router,
    tags=["process"]
)

# ======= Quote analysis endpoints =======
# POST /api/v1/quotes/analyze - Analyze quotes for RFQ
api_router.include_router(
    quotes_router,
    tags=["quotes"]
)

# ======= LLM testing endpoints =======
# POST /api/v1/llm/test - Test LLM functionality
api_router.include_router(
    llm_router,
    tags=["llm"]
)

# ======= Admin endpoints =======
# POST /api/v1/admin/update_extractors/ - Update extractor agents
api_router.include_router(
    admin_router,
    tags=["admin"]
)
