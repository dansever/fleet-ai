from fastapi import APIRouter
from app.api.v1.endpoints import extract_router, quotes_router, llm_router

api_router = APIRouter()

# ======= Document extraction endpoints =======
# POST /api/v1/extract/quotes - Extract quotes
# POST /api/v1/extraction/extract/rfqs - Extract RFQs  
# POST /api/v1/extract/fuel/bids - Extract fuel bids
# POST /api/v1/extract/fuel/contracts - Extract fuel contracts
# POST /api/v1/extract/service-contracts - Extract service contracts
api_router.include_router(
    extract_router,
    tags=["extraction"]
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