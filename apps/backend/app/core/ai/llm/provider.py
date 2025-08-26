"""
Abstract LLM provider interface.
All LLM providers must implement this interface.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.shared.schemas.ai import LLMRequest, LLMResponse


class LLMProvider(ABC):
    """Abstract interface for LLM providers."""
    
    def __init__(self, provider_name: str, default_model: Optional[str] = None):
        self.provider_name = provider_name
        self.default_model = default_model
        self.is_available = True
    
    @abstractmethod
    async def generate_response(self, request: LLMRequest) -> LLMResponse:
        """Generate a response from the LLM provider."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the provider is healthy and available."""
        pass
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Get information about the provider."""
        return {
            "name": self.provider_name,
            "default_model": self.default_model,
            "available": self.is_available,
            "type": "llm_provider"
        }
    
    def validate_request(self, request: LLMRequest) -> bool:
        """Validate the LLM request."""
        if not request.prompt or len(request.prompt.strip()) == 0:
            return False
        
        if request.max_output_tokens < 1 or request.max_output_tokens > 8192:
            return False
        
        if request.temperature < 0.0 or request.temperature > 2.0:
            return False
        
        return True
    
    def format_prompt(self, request: LLMRequest) -> str:
        """Format the prompt for the specific provider."""
        prompt = request.prompt
        
        if request.system:
            prompt = f"System: {request.system}\n\nUser: {prompt}"
        
        return prompt
    
    def get_model_name(self, request: LLMRequest) -> str:
        """Get the model name to use for the request."""
        return request.model or self.default_model or "default"
