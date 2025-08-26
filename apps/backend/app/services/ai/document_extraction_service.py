"""
Document extraction service using AI/LLM capabilities.
Handles extraction of structured data from various document types.
"""

from typing import Dict, Any, List, Optional
from app.core.ai.base import LLMServiceBase
from app.utils.logger import get_logger

logger = get_logger(__name__)


class DocumentExtractionService(LLMServiceBase):
    """Service for extracting structured data from documents using AI."""
    
    def __init__(self):
        super().__init__("document_extraction", default_model="gemini-1.5-flash")
        self.logger = logger
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a document extraction request."""
        document_type = request.get("document_type")
        content = request.get("content")
        extraction_schema = request.get("extraction_schema")
        
        if not document_type or not content:
            raise ValueError("Document type and content are required")
        
        return await self.extract_document_data(document_type, content, extraction_schema)
    
    async def extract_document_data(
        self, 
        document_type: str, 
        content: str, 
        extraction_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Extract structured data from document content.
        
        Args:
            document_type: Type of document (e.g., 'fuel_bid', 'rfq', 'quote')
            content: Document text content
            extraction_schema: Optional schema for structured extraction
            
        Returns:
            Extracted data in structured format
        """
        try:
            # Create extraction prompt based on document type
            prompt = self._create_extraction_prompt(document_type, content, extraction_schema)
            
            # Create system message
            system_message = self._create_extraction_system_message(document_type)
            
            # Generate extraction using LLM
            response = await self.generate_llm_response(
                prompt=prompt,
                system_message=system_message,
                max_output_tokens=1500,
                temperature=0.1
            )
            
            # Process and structure the response
            extracted_data = self._process_extraction_response(response.content, document_type)
            
            return {
                "document_type": document_type,
                "extraction_success": True,
                "extracted_data": extracted_data,
                "raw_llm_response": response.content,
                "usage": response.usage.dict() if response.usage else None
            }
            
        except Exception as e:
            logger.error(f"❌ Document extraction failed for {document_type}: {e}")
            return {
                "document_type": document_type,
                "extraction_success": False,
                "error": str(e),
                "extracted_data": {}
            }
    
    def _create_extraction_prompt(
        self, 
        document_type: str, 
        content: str, 
        extraction_schema: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a prompt for document extraction."""
        
        base_prompt = f"""
        Please extract key information from the following {document_type} document.
        
        Document Content:
        {content[:2000]}...
        
        Please extract the following information:"""
        
        if extraction_schema:
            # Use provided schema
            schema_prompt = "\n".join([
                f"- {field}: {description}" 
                for field, description in extraction_schema.items()
            ])
            base_prompt += f"\n\nExtraction Schema:\n{schema_prompt}"
        else:
            # Use default schema based on document type
            default_schema = self._get_default_extraction_schema(document_type)
            schema_prompt = "\n".join([
                f"- {field}: {description}" 
                for field, description in default_schema.items()
            ])
            base_prompt += f"\n\nExtraction Schema:\n{schema_prompt}"
        
        base_prompt += "\n\nPlease provide the extracted information in a structured format."
        return base_prompt
    
    def _create_extraction_system_message(self, document_type: str) -> str:
        """Create system message for document extraction."""
        return f"""You are an expert document extraction specialist for {document_type} documents.

Your task is to:
1. Carefully read and analyze the document content
2. Extract all relevant information according to the specified schema
3. Provide accurate, complete, and well-structured data
4. Handle missing information gracefully (mark as "N/A" or "Not specified")
5. Maintain data integrity and consistency

Be thorough but concise. If information is unclear or ambiguous, note it in the extraction."""
    
    def _get_default_extraction_schema(self, document_type: str) -> Dict[str, str]:
        """Get default extraction schema for document type."""
        schemas = {
            "fuel_bid": {
                "vendor_name": "Name of the fuel vendor/supplier",
                "fuel_type": "Type of fuel being bid on",
                "quantity": "Quantity of fuel in appropriate units",
                "price_per_unit": "Price per unit of fuel",
                "currency": "Currency of the price",
                "delivery_location": "Location for fuel delivery",
                "delivery_date": "Expected delivery date",
                "payment_terms": "Payment terms and conditions",
                "validity_period": "How long the bid is valid"
            },
            "rfq": {
                "rfq_number": "Request for Quote number",
                "part_number": "Part number being requested",
                "part_description": "Description of the part",
                "quantity": "Quantity requested",
                "unit_of_measure": "Unit of measurement",
                "urgency_level": "How urgent the request is",
                "delivery_requirements": "Delivery requirements and timeline",
                "technical_specifications": "Technical specifications if any"
            },
            "quote": {
                "vendor_name": "Name of the vendor providing the quote",
                "part_number": "Part number being quoted",
                "price": "Quoted price",
                "currency": "Currency of the price",
                "quantity": "Quantity being quoted",
                "lead_time": "Lead time for delivery",
                "warranty": "Warranty information",
                "payment_terms": "Payment terms",
                "delivery_terms": "Delivery terms and conditions"
            }
        }
        
        return schemas.get(document_type, {
            "general_info": "General information from the document",
            "key_details": "Key details and specifications",
            "dates": "Important dates mentioned",
            "prices": "Price information if any",
            "contacts": "Contact information if any"
        })
    
    def _process_extraction_response(self, response: str, document_type: str) -> Dict[str, Any]:
        """Process the LLM response into structured data."""
        # This is a simple text-based extraction
        # In a production system, you might want to use structured output or parsing
        
        extracted_data = {
            "document_type": document_type,
            "extraction_timestamp": "2024-01-01T00:00:00Z",  # Would use actual timestamp
            "extracted_text": response,
            "confidence": "high"  # Would be calculated based on response quality
        }
        
        return extracted_data
    
    async def extract_fuel_bid_data(self, content: str) -> Dict[str, Any]:
        """Extract data specifically from fuel bid documents."""
        return await self.extract_document_data("fuel_bid", content)
    
    async def extract_rfq_data(self, content: str) -> Dict[str, Any]:
        """Extract data specifically from RFQ documents."""
        return await self.extract_document_data("rfq", content)
    
    async def extract_quote_data(self, content: str) -> Dict[str, Any]:
        """Extract data specifically from quote documents."""
        return await self.extract_document_data("quote", content)
