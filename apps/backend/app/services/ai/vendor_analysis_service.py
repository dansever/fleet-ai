"""
Vendor analysis service using AI/LLM capabilities.
Analyzes vendor performance, reliability, and provides recommendations.
"""

from typing import Dict, Any, List, Optional
from app.core.ai.base import LLMServiceBase
from app.utils.logger import get_logger

logger = get_logger(__name__)


class VendorAnalysisService(LLMServiceBase):
    """Service for analyzing vendors using AI."""
    
    def __init__(self):
        super().__init__("vendor_analysis", default_model="gemini-1.5-flash")
        self.logger = logger
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a vendor analysis request."""
        vendor_id = request.get("vendor_id")
        analysis_type = request.get("analysis_type", "comprehensive")
        
        if not vendor_id:
            raise ValueError("Vendor ID is required")
        
        return await self.analyze_vendor(vendor_id, analysis_type)
    
    async def analyze_vendor(
        self, 
        vendor_id: str, 
        analysis_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """
        Analyze a vendor's performance and provide insights.
        
        Args:
            vendor_id: ID of the vendor to analyze
            analysis_type: Type of analysis to perform
            
        Returns:
            Vendor analysis results
        """
        try:
            # Get vendor data (this would come from your database)
            vendor_data = await self._get_vendor_data(vendor_id)
            if not vendor_data:
                raise ValueError(f"Vendor with ID {vendor_id} not found")
            
            # Get vendor performance history
            performance_data = await self._get_vendor_performance(vendor_id)
            
            # Create analysis prompt
            prompt = self._create_vendor_analysis_prompt(vendor_data, performance_data, analysis_type)
            
            # Create system message
            system_message = self._create_vendor_analysis_system_message(analysis_type)
            
            # Generate analysis using LLM
            response = await self.generate_llm_response(
                prompt=prompt,
                system_message=system_message,
                max_output_tokens=2000,
                temperature=0.1
            )
            
            # Process the response
            analysis_result = self._process_vendor_analysis_response(
                response.content, 
                vendor_data, 
                performance_data,
                analysis_type
            )
            
            return {
                "vendor_id": vendor_id,
                "analysis_type": analysis_type,
                "analysis_success": True,
                "analysis_result": analysis_result,
                "raw_llm_response": response.content,
                "usage": response.usage.dict() if response.usage else None
            }
            
        except Exception as e:
            logger.error(f"❌ Vendor analysis failed for {vendor_id}: {e}")
            return {
                "vendor_id": vendor_id,
                "analysis_type": analysis_type,
                "analysis_success": False,
                "error": str(e),
                "analysis_result": {}
            }
    
    async def _get_vendor_data(self, vendor_id: str) -> Optional[Dict[str, Any]]:
        """Get vendor data from database."""
        # This would be implemented to fetch from your actual database
        # For now, returning mock data
        return {
            "id": vendor_id,
            "name": "Sample Vendor",
            "type": "Parts Supplier",
            "rating": 4.2,
            "certifications": ["ISO 9001", "AS9100"],
            "location": "United States",
            "years_in_business": 15
        }
    
    async def _get_vendor_performance(self, vendor_id: str) -> List[Dict[str, Any]]:
        """Get vendor performance history."""
        # This would be implemented to fetch from your actual database
        # For now, returning mock data
        return [
            {
                "order_id": "ORD-001",
                "delivery_date": "2024-01-15",
                "on_time_delivery": True,
                "quality_rating": 5,
                "cost_variance": 0.02
            },
            {
                "order_id": "ORD-002", 
                "delivery_date": "2024-02-01",
                "on_time_delivery": True,
                "quality_rating": 4,
                "cost_variance": -0.01
            }
        ]
    
    def _create_vendor_analysis_prompt(
        self, 
        vendor_data: Dict[str, Any], 
        performance_data: List[Dict[str, Any]], 
        analysis_type: str
    ) -> str:
        """Create a prompt for vendor analysis."""
        
        prompt = f"""
        Please analyze the following vendor data and provide insights.
        
        Vendor Information:
        - Name: {vendor_data.get('name', 'N/A')}
        - Type: {vendor_data.get('type', 'N/A')}
        - Rating: {vendor_data.get('rating', 'N/A')}
        - Certifications: {', '.join(vendor_data.get('certifications', []))}
        - Location: {vendor_data.get('location', 'N/A')}
        - Years in Business: {vendor_data.get('years_in_business', 'N/A')}
        
        Performance History ({len(performance_data)} orders):
        """
        
        for i, perf in enumerate(performance_data, 1):
            prompt += f"""
        Order {i}:
        - Order ID: {perf.get('order_id', 'N/A')}
        - Delivery Date: {perf.get('delivery_date', 'N/A')}
        - On Time Delivery: {perf.get('on_time_delivery', 'N/A')}
        - Quality Rating: {perf.get('quality_rating', 'N/A')}/5
        - Cost Variance: {perf.get('cost_variance', 'N/A')}
        """
        
        prompt += f"""
        
        Please provide a {analysis_type} analysis including:
        1. Overall vendor assessment
        2. Performance analysis
        3. Risk assessment
        4. Recommendations
        5. Key strengths and weaknesses
        
        Format your response as structured text with clear sections."""
        
        return prompt
    
    def _create_vendor_analysis_system_message(self, analysis_type: str) -> str:
        """Create system message for vendor analysis."""
        return f"""You are an expert vendor management analyst specializing in {analysis_type} analysis.

Your task is to:
1. Evaluate vendor performance objectively
2. Identify trends and patterns in their performance
3. Assess risks and opportunities
4. Provide actionable recommendations
5. Consider industry best practices and standards

Be thorough, objective, and provide evidence-based insights."""
    
    def _process_vendor_analysis_response(
        self, 
        response: str, 
        vendor_data: Dict[str, Any], 
        performance_data: List[Dict[str, Any]],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Process the LLM response into structured analysis."""
        
        # Calculate some metrics
        total_orders = len(performance_data)
        on_time_deliveries = sum(1 for p in performance_data if p.get('on_time_delivery', False))
        avg_quality = sum(p.get('quality_rating', 0) for p in performance_data) / total_orders if total_orders > 0 else 0
        
        return {
            "vendor_name": vendor_data.get('name'),
            "analysis_type": analysis_type,
            "analysis_timestamp": "2024-01-01T00:00:00Z",  # Would use actual timestamp
            "summary": response[:500] + "..." if len(response) > 500 else response,
            "metrics": {
                "total_orders": total_orders,
                "on_time_delivery_rate": on_time_deliveries / total_orders if total_orders > 0 else 0,
                "average_quality_rating": round(avg_quality, 2),
                "vendor_rating": vendor_data.get('rating', 0)
            },
            "full_analysis": response
        }
    
    async def compare_vendors(self, vendor_ids: List[str]) -> Dict[str, Any]:
        """Compare multiple vendors."""
        try:
            vendor_analyses = []
            
            for vendor_id in vendor_ids:
                analysis = await self.analyze_vendor(vendor_id, "comparison")
                vendor_analyses.append(analysis)
            
            # Create comparison prompt
            comparison_prompt = self._create_vendor_comparison_prompt(vendor_analyses)
            
            # Generate comparison using LLM
            response = await self.generate_llm_response(
                prompt=comparison_prompt,
                system_message="You are an expert vendor comparison analyst. Provide objective comparisons and recommendations.",
                max_output_tokens=2500,
                temperature=0.1
            )
            
            return {
                "comparison_success": True,
                "vendor_analyses": vendor_analyses,
                "comparison_result": response.content,
                "usage": response.usage.dict() if response.usage else None
            }
            
        except Exception as e:
            logger.error(f"❌ Vendor comparison failed: {e}")
            return {
                "comparison_success": False,
                "error": str(e),
                "vendor_analyses": []
            }
    
    def _create_vendor_comparison_prompt(self, vendor_analyses: List[Dict[str, Any]]) -> str:
        """Create a prompt for comparing multiple vendors."""
        prompt = "Please compare the following vendors and provide recommendations:\n\n"
        
        for i, analysis in enumerate(vendor_analyses, 1):
            vendor_name = analysis.get('analysis_result', {}).get('vendor_name', f'Vendor {i}')
            prompt += f"Vendor {i}: {vendor_name}\n"
            prompt += f"Analysis: {analysis.get('raw_llm_response', 'N/A')[:300]}...\n\n"
        
        prompt += "Please provide:\n1. Side-by-side comparison\n2. Strengths and weaknesses of each\n3. Overall recommendation\n4. Risk assessment\n5. Key considerations for selection"
        
        return prompt
