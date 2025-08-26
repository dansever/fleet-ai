"""
AI Service Manager for FleetAI backend.
Provides a unified interface to all AI services and manages their lifecycle.
"""

from typing import Dict, Any, Optional, List
from app.core.ai.base import AIServiceBase
from app.services.ai import DocumentExtractionService, VendorAnalysisService
from app.services.quote_analysis_service import QuoteAnalysisService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AIServiceManager:
    """Manages all AI services and provides a unified interface."""
    
    def __init__(self):
        self.services: Dict[str, AIServiceBase] = {}
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize all available AI services."""
        try:
            # Initialize core AI services
            self.services["document_extraction"] = DocumentExtractionService()
            self.services["vendor_analysis"] = VendorAnalysisService()
            self.services["quote_analysis"] = QuoteAnalysisService()
            
            logger.info(f"✅ Initialized {len(self.services)} AI services")
            
        except Exception as e:
            logger.error(f"❌ Error initializing AI services: {e}")
    
    def get_service(self, service_name: str) -> Optional[AIServiceBase]:
        """Get an AI service by name."""
        return self.services.get(service_name)
    
    def list_services(self) -> List[Dict[str, Any]]:
        """List all available AI services with their information."""
        return [
            {
                "name": name,
                "info": service.get_service_info()
            }
            for name, service in self.services.items()
        ]
    
    async def process_request(
        self, 
        service_name: str, 
        request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process a request using the specified AI service.
        
        Args:
            service_name: Name of the service to use
            request: Request data
            
        Returns:
            Service response
        """
        service = self.get_service(service_name)
        if not service:
            return {
                "success": False,
                "error": f"Service '{service_name}' not found",
                "available_services": list(self.services.keys())
            }
        
        try:
            result = await service.process_request(request)
            return {
                "success": True,
                "service": service_name,
                "result": result
            }
        except Exception as e:
            logger.error(f"❌ Error processing request with service '{service_name}': {e}")
            return {
                "success": False,
                "service": service_name,
                "error": str(e)
            }
    
    async def extract_document(
        self, 
        document_type: str, 
        content: str, 
        extraction_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Extract data from a document using the document extraction service."""
        service = self.get_service("document_extraction")
        if not service:
            return {"success": False, "error": "Document extraction service not available"}
        
        try:
            result = await service.extract_document_data(document_type, content, extraction_schema)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"❌ Document extraction failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def analyze_vendor(
        self, 
        vendor_id: str, 
        analysis_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """Analyze a vendor using the vendor analysis service."""
        service = self.get_service("vendor_analysis")
        if not service:
            return {"success": False, "error": "Vendor analysis service not available"}
        
        try:
            result = await service.analyze_vendor(vendor_id, analysis_type)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"❌ Vendor analysis failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def analyze_quotes_for_rfq(self, rfq_id: str) -> Dict[str, Any]:
        """Analyze quotes for an RFQ using the quote analysis service."""
        service = self.get_service("quote_analysis")
        if not service:
            return {"success": False, "error": "Quote analysis service not available"}
        
        try:
            result = await service.analyze_quotes_for_rfq(rfq_id)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"❌ Quote analysis failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def compare_vendors(self, vendor_ids: List[str]) -> Dict[str, Any]:
        """Compare multiple vendors."""
        service = self.get_service("vendor_analysis")
        if not service:
            return {"success": False, "error": "Vendor analysis service not available"}
        
        try:
            result = await service.compare_vendors(vendor_ids)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"❌ Vendor comparison failed: {e}")
            return {"success": False, "error": str(e)}
    
    def get_service_health(self) -> Dict[str, Any]:
        """Get health status of all AI services."""
        health_status = {}
        
        for name, service in self.services.items():
            try:
                service_info = service.get_service_info()
                health_status[name] = {
                    "status": "healthy",
                    "info": service_info
                }
            except Exception as e:
                health_status[name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
        
        return health_status


# Global instance
ai_service_manager = AIServiceManager()


# Convenience functions for easy access
async def extract_document(
    document_type: str, 
    content: str, 
    extraction_schema: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Extract data from a document."""
    return await ai_service_manager.extract_document(document_type, content, extraction_schema)


async def analyze_vendor(
    vendor_id: str, 
    analysis_type: str = "comprehensive"
) -> Dict[str, Any]:
    """Analyze a vendor."""
    return await ai_service_manager.analyze_vendor(vendor_id, analysis_type)


async def analyze_quotes_for_rfq(rfq_id: str) -> Dict[str, Any]:
    """Analyze quotes for an RFQ."""
    return await ai_service_manager.analyze_quotes_for_rfq(rfq_id)


async def compare_vendors(vendor_ids: List[str]) -> Dict[str, Any]:
    """Compare multiple vendors."""
    return await ai_service_manager.compare_vendors(vendor_ids)


def get_ai_service_manager() -> AIServiceManager:
    """Get the global AI service manager instance."""
    return ai_service_manager
