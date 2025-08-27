"""
Base AI service interface and common functionality.
All AI services should inherit from this base class.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.shared.schemas.ai import LLMResponse, LLMRequest


class AIServiceBase(ABC):
    """Base class for all AI services in the application."""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = None  # Will be set by subclasses
    
    @abstractmethod
    async def process_request(self, request: Any) -> Any:
        """Process an AI service request."""
        pass
    
    def validate_input(self, data: Any) -> bool:
        """Validate input data for the service."""
        return True
    
    def format_response(self, result: Any) -> Dict[str, Any]:
        """Format the service response."""
        return {"result": result, "service": self.service_name}
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get information about the service."""
        return {
            "name": self.service_name,
            "type": "ai_service",
            "status": "active"
        }


class LLMServiceBase(AIServiceBase):
    """Base class for LLM-based AI services."""
    
    def __init__(self, service_name: str, default_model: Optional[str] = None):
        super().__init__(service_name)
        self.default_model = default_model
    
    async def generate_llm_response(
        self, 
        prompt: str, 
        system_message: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> LLMResponse:
        """Generate a response using the LLM provider."""
        from .llm.router import get_llm_provider
        
        llm_provider = get_llm_provider()
        
        # Prepare the request
        request = LLMRequest(
            prompt=prompt,
            system=system_message,
            model=model or self.default_model,
            **kwargs
        )
        
        return await llm_provider.generate_response(request)
    
    def create_system_prompt(self, context: str, instructions: str) -> str:
        """Create a system prompt with context and instructions."""
        return f"""Context: {context}

Instructions: {instructions}

Please provide a clear, accurate, and helpful response based on the above context and instructions."""
    
    def create_analysis_prompt(self, data: Dict[str, Any], analysis_type: str) -> str:
        """Create a prompt for data analysis tasks."""
        return f"""You are an expert {analysis_type} analyst. 

Please analyze the following data and provide insights:

{self._format_data_for_analysis(data)}

Please provide:
1. Key findings and insights
2. Recommendations
3. Risk assessment (if applicable)
4. Summary

Format your response as structured text with clear sections."""
    
    def _format_data_for_analysis(self, data: Dict[str, Any]) -> str:
        """Format data for analysis prompts."""
        formatted = []
        for key, value in data.items():
            if isinstance(value, (list, dict)):
                formatted.append(f"{key}: {str(value)[:200]}...")
            else:
                formatted.append(f"{key}: {value}")
        return "\n".join(formatted)
