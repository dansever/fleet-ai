import asyncpg
from typing import Dict, List, Any, Optional
from app.database import get_db_connection
from app.utils import get_logger
from app.core.ai.base import LLMServiceBase

logger = get_logger(__name__)

class QuoteAnalysisService(LLMServiceBase):
    """Service for analyzing quotes and providing insights"""
    
    def __init__(self):
        super().__init__("quote_analysis", default_model="gemini-1.5-flash")
        self.logger = logger
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a quote analysis request."""
        rfq_id = request.get("rfq_id")
        if not rfq_id:
            raise ValueError("RFQ ID is required")
        
        return await self.analyze_quotes_for_rfq(rfq_id)
    
    async def analyze_quotes_for_rfq(self, rfq_id: str) -> Dict[str, Any]:
        """
        Analyze all quotes for a given RFQ and provide insights
        
        Args:
            rfq_id: The RFQ ID to analyze quotes for
            
        Returns:
            Analysis results with insights and recommendations
        """
        try:
            # Get database connection
            pool = await get_db_connection()
            
            async with pool.acquire() as connection:
                # Fetch RFQ details
                rfq_data = await self._get_rfq_details(connection, rfq_id)
                if not rfq_data:
                    raise ValueError(f"RFQ with ID {rfq_id} not found")
                
                # Fetch all quotes for this RFQ
                quotes_data = await self._get_quotes_for_rfq(connection, rfq_id)
                if not quotes_data:
                    return {
                        "rfq_id": rfq_id,
                        "analysis": "No quotes found for this RFQ",
                        "insights": [],
                        "recommendations": [],
                        "selected_quote_recommendation": None
                    }
                
                # Analyze quotes using LLM
                analysis_result = await self._analyze_quotes_with_llm(rfq_data, quotes_data)
                
                logger.info(f"✅ Successfully analyzed {len(quotes_data)} quotes for RFQ {rfq_id}")
                return analysis_result
                
        except Exception as e:
            logger.error(f"❌ Error analyzing quotes for RFQ {rfq_id}: {e}")
            raise
    
    async def _get_rfq_details(self, connection: asyncpg.Connection, rfq_id: str) -> Optional[Dict[str, Any]]:
        """Fetch RFQ details from database"""
        query = """
        SELECT 
            r.id,
            r.rfq_number,
            r.part_number,
            r.alt_part_number,
            r.part_description,
            r.condition_code,
            r.quantity,
            r.unit_of_measure,
            r.pricing_type,
            r.urgency_level,
            r.buyer_comments,
            r.status,
            r.selected_quote_id,
            r.created_at
        FROM rfqs r
        WHERE r.id = $1
        """
        
        row = await connection.fetchrow(query, rfq_id)
        if not row:
            return None
            
        return dict(row)
    
    async def _get_quotes_for_rfq(self, connection: asyncpg.Connection, rfq_id: str) -> List[Dict[str, Any]]:
        """Fetch all quotes for a given RFQ"""
        query = """
        SELECT 
            q.id,
            q.rfq_id,
            q.rfq_number,
            q.vendor_name,
            q.vendor_contact_name,
            q.vendor_contact_email,
            q.part_number,
            q.part_description,
            q.condition_code as part_condition,
            q.quantity,
            q.unit_of_measure,
            q.price,
            q.currency,
            q.pricing_type,
            q.pricing_method,
            q.payment_terms,
            q.lead_time,
            q.delivery_terms,
            q.warranty,
            q.quote_expiration_date,
            q.certifications,
            q.vendor_comments,
            q.status,
            q.created_at
        FROM quotes q
        WHERE q.rfq_id = $1
        ORDER BY q.created_at DESC
        """
        
        rows = await connection.fetch(query, rfq_id)
        return [dict(row) for row in rows]
    
    async def _analyze_quotes_with_llm(self, rfq_data: Dict[str, Any], quotes_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Use LLM to analyze quotes and provide insights"""
        
        # Create analysis prompt using the base class method
        analysis_prompt = self.create_analysis_prompt(
            data={
                "rfq_details": self._format_rfq_for_analysis(rfq_data),
                "quotes": self._format_quotes_for_analysis(quotes_data),
                "total_quotes": len(quotes_data)
            },
            analysis_type="procurement and quote analysis"
        )
        
        # Create system prompt
        system_prompt = self.create_system_prompt(
            context="You are analyzing procurement quotes for an aviation parts RFQ",
            instructions="""Please provide a comprehensive analysis including:

1. **Overall Assessment**: Summary of the quotes received and their quality
2. **Price Analysis**: Compare prices, identify outliers, assess value for money
3. **Vendor Analysis**: Evaluate vendor capabilities, reliability indicators
4. **Technical Compliance**: How well quotes meet the technical requirements
5. **Commercial Terms**: Analysis of payment terms, delivery, warranty
6. **Risk Assessment**: Identify potential risks with each quote
7. **Recommendation**: Which quote to select and why
8. **Key Insights**: Important observations and considerations

Format your response as a structured text with clear sections."""
        )
        
        try:
            # Get analysis from LLM using the base class method
            response = await self.generate_llm_response(
                prompt=analysis_prompt,
                system_message=system_prompt,
                max_output_tokens=2000,
                temperature=0.1
            )
            
            # Parse and structure the response
            analysis_result = {
                "rfq_id": rfq_data["id"],
                "rfq_number": rfq_data["rfq_number"],
                "quotes_analyzed": len(quotes_data),
                "analysis_timestamp": "2024-01-01T00:00:00Z",  # Would use actual timestamp
                "llm_analysis": response.content,
                "quotes_summary": self._create_quotes_summary(quotes_data),
                "usage": response.usage.dict() if response.usage else None
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"❌ Error in LLM analysis: {e}")
            # Return fallback analysis
            return self._create_fallback_analysis(rfq_data, quotes_data)
    
    def _format_rfq_for_analysis(self, rfq_data: Dict[str, Any]) -> str:
        """Format RFQ data for LLM analysis"""
        return f"""
        - RFQ Number: {rfq_data.get('rfq_number', 'N/A')}
        - Part Number: {rfq_data.get('part_number', 'N/A')}
        - Alt Part Number: {rfq_data.get('alt_part_number', 'N/A')}
        - Description: {rfq_data.get('part_description', 'N/A')}
        - Condition: {rfq_data.get('condition_code', 'N/A')}
        - Quantity: {rfq_data.get('quantity', 'N/A')} {rfq_data.get('unit_of_measure', '')}
        - Urgency: {rfq_data.get('urgency_level', 'N/A')}
        - Buyer Comments: {rfq_data.get('buyer_comments', 'N/A')}
        """
    
    def _format_quotes_for_analysis(self, quotes_data: List[Dict[str, Any]]) -> str:
        """Format quotes data for LLM analysis"""
        formatted_quotes = []
        
        for i, quote in enumerate(quotes_data, 1):
            quote_text = f"""
        Quote {i} (ID: {quote.get('id')}):
        - Vendor: {quote.get('vendor_name', 'N/A')}
        - Price: {quote.get('price', 'N/A')} {quote.get('currency', '')}
        - Lead Time: {quote.get('lead_time', 'N/A')}
        - Warranty: {quote.get('warranty', 'N/A')}
        - Payment Terms: {quote.get('payment_terms', 'N/A')}
        - Delivery Terms: {quote.get('delivery_terms', 'N/A')}
        - Certifications: {', '.join(quote.get('certifications', []) or [])}
        - Comments: {quote.get('vendor_comments', 'N/A')}
        """
            formatted_quotes.append(quote_text)
        
        return '\n'.join(formatted_quotes)
    
    def _create_quotes_summary(self, quotes_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create a summary of quotes for the response"""
        summary = []
        
        for quote in quotes_data:
            summary.append({
                "quote_id": quote.get('id'),
                "vendor_name": quote.get('vendor_name'),
                "price": quote.get('price'),
                "currency": quote.get('currency'),
                "lead_time": quote.get('lead_time'),
                "status": quote.get('status')
            })
        
        return summary
    
    def _create_fallback_analysis(self, rfq_data: Dict[str, Any], quotes_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create fallback analysis when LLM fails"""
        return {
            "rfq_id": rfq_data["id"],
            "rfq_number": rfq_data["rfq_number"],
            "quotes_analyzed": len(quotes_data),
            "analysis_timestamp": "2024-01-01T00:00:00Z",
            "llm_analysis": "Analysis temporarily unavailable. Please try again later.",
            "quotes_summary": self._create_quotes_summary(quotes_data),
            "error": "LLM analysis failed, showing basic quote information"
        }
