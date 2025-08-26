"""
API routes for AI services.
Provides endpoints for document extraction, vendor analysis, and quote analysis.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.services.ai_service_manager import get_ai_service_manager
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Services"])


# Request/Response Models
class DocumentExtractionRequest(BaseModel):
    document_type: str
    content: str
    extraction_schema: Optional[Dict[str, str]] = None


class VendorAnalysisRequest(BaseModel):
    vendor_id: str
    analysis_type: str = "comprehensive"


class QuoteAnalysisRequest(BaseModel):
    rfq_id: str


class VendorComparisonRequest(BaseModel):
    vendor_ids: List[str]


class AIResponse(BaseModel):
    success: bool
    service: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# Dependency
def get_ai_manager():
    return get_ai_service_manager()


@router.post("/extract-document", response_model=AIResponse)
async def extract_document(
    request: DocumentExtractionRequest,
    ai_manager = Depends(get_ai_manager)
):
    """Extract structured data from a document."""
    try:
        result = await ai_manager.extract_document(
            document_type=request.document_type,
            content=request.content,
            extraction_schema=request.extraction_schema
        )
        return AIResponse(
            success=result["success"],
            service="document_extraction",
            result=result.get("result"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"❌ Document extraction API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-vendor", response_model=AIResponse)
async def analyze_vendor(
    request: VendorAnalysisRequest,
    ai_manager = Depends(get_ai_manager)
):
    """Analyze a vendor's performance."""
    try:
        result = await ai_manager.analyze_vendor(
            vendor_id=request.vendor_id,
            analysis_type=request.analysis_type
        )
        return AIResponse(
            success=result["success"],
            service="vendor_analysis",
            result=result.get("result"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"❌ Vendor analysis API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-quotes", response_model=AIResponse)
async def analyze_quotes(
    request: QuoteAnalysisRequest,
    ai_manager = Depends(get_ai_manager)
):
    """Analyze quotes for an RFQ."""
    try:
        result = await ai_manager.analyze_quotes_for_rfq(rfq_id=request.rfq_id)
        return AIResponse(
            success=result["success"],
            service="quote_analysis",
            result=result.get("result"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"❌ Quote analysis API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare-vendors", response_model=AIResponse)
async def compare_vendors(
    request: VendorComparisonRequest,
    ai_manager = Depends(get_ai_manager)
):
    """Compare multiple vendors."""
    try:
        result = await ai_manager.compare_vendors(vendor_ids=request.vendor_ids)
        return AIResponse(
            success=result["success"],
            service="vendor_analysis",
            result=result.get("result"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"❌ Vendor comparison API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/services")
async def list_ai_services(ai_manager = Depends(get_ai_manager)):
    """List all available AI services."""
    try:
        services = ai_manager.list_services()
        return {
            "success": True,
            "services": services,
            "total_services": len(services)
        }
    except Exception as e:
        logger.error(f"❌ Error listing AI services: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def get_ai_services_health(ai_manager = Depends(get_ai_manager)):
    """Get health status of all AI services."""
    try:
        health = ai_manager.get_service_health()
        return {
            "success": True,
            "health": health,
            "total_services": len(health)
        }
    except Exception as e:
        logger.error(f"❌ Error getting AI services health: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-request")
async def process_ai_request(
    service_name: str,
    request_data: Dict[str, Any],
    ai_manager = Depends(get_ai_manager)
):
    """Process a generic request using any AI service."""
    try:
        result = await ai_manager.process_request(service_name, request_data)
        return result
    except Exception as e:
        logger.error(f"❌ Generic AI request error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
