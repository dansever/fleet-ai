from fastapi import APIRouter
from app.api.v1.endpoints import extraction_router, quotes_router, llm_router, ai_router

api_router = APIRouter()

# ======= Document extraction endpoints =======
# POST /api/v1/extraction/extract/quotes - Extract quotes
# POST /api/v1/extraction/extract/rfqs - Extract RFQs  
# POST /api/v1/extraction/extract/fuel/bids - Extract fuel bids
# POST /api/v1/extraction/extract/fuel/contracts - Extract fuel contracts
# POST /api/v1/extraction/extract/service-contracts - Extract service contracts
api_router.include_router(
    extraction_router,
    prefix="/extraction",
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

# ======= AI Services endpoints =======
# POST /api/v1/ai/analyze-text - Text analysis
# POST /api/v1/ai/extract-insights - Data insights
# POST /api/v1/ai/compare-items - Item comparison
# POST /api/v1/ai/generate-recommendations - Business recommendations
# POST /api/v1/ai/assess-risk - Risk assessment
# POST /api/v1/ai/analyze-quotes - Quote analysis
# GET /api/v1/ai/health - AI health check
# GET /api/v1/ai/capabilities - Available capabilities
api_router.include_router(
    ai_router,
    tags=["ai-services"]
)