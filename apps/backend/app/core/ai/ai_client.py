"""
AI Client for FleetAI backend.
Provides organized, simple yet powerful AI functionality throughout the application.
"""

import os
from typing import Dict, Any, Optional
from app.utils.logger import get_logger
from app.config import ACTIVE_GEMINI_MODEL, GEMINI_API_KEY

logger = get_logger(__name__)

# AI Client - organized and powerful
class AIClient:
    """AI Client using Gemini for intelligent analysis and insights"""
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(ACTIVE_GEMINI_MODEL)
            logger.info("✅ AI Client initialized successfully")
        except ImportError:
            logger.error("❌ google-generativeai package not installed")
            raise
    
    async def generate_response(
        self, 
        prompt: str, 
        system_message: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.1
    ) -> str:
        """Generate a response using AI"""
        try:
            full_prompt = f"{system_message}\n\n{prompt}" if system_message else prompt
            
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    'max_output_tokens': max_tokens,
                    'temperature': temperature,
                }
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"❌ AI generation failed: {e}")
            return f"Analysis temporarily unavailable: {str(e)}"

# Global AI client instance
_ai_client_instance: Optional[AIClient] = None

def get_ai_client() -> AIClient:
    """Get the global AI client instance"""
    global _ai_client_instance
    if _ai_client_instance is None:
        _ai_client_instance = AIClient()
    return _ai_client_instance


# Simple LLM function - mainly for testing
async def llm_query(
    prompt: str,
    system_message: Optional[str] = None,
    max_output_tokens: int = 2000,
    temperature: float = 0.1,
    response_schema: Optional[Any] = None,
    top_p: float = 0.9,
    stop_sequences: Optional[list] = None,
    response_format: Optional[str] = None
) -> str:
    """Simple LLM function"""
    ai_client = get_ai_client()
    return await ai_client.generate_response(prompt, system_message, max_output_tokens, temperature, response_schema, top_p, stop_sequences, response_format)


# Core AI functions for application-wide use
async def analyze_text(
    text: str, 
    analysis_type: str,
    system_message: Optional[str] = None
) -> str:
    """Analyze text using AI throughout the application"""
    ai_client = get_ai_client()
    
    prompt = f"Please analyze the following {analysis_type}:\n\n{text}"
    
    if not system_message:
        system_message = f"You are an expert {analysis_type} analyst. Provide clear, structured analysis with insights and recommendations."
    
    return await ai_client.generate_response(prompt, system_message)


async def extract_insights(
    data: Dict[str, Any], 
    data_type: str,
    focus_areas: Optional[list] = None
) -> str:
    """Extract insights from structured data across the application"""
    ai_client = get_ai_client()
    
    # Format data for analysis
    data_text = "\n".join([f"{k}: {v}" for k, v in data.items()])
    
    focus_text = ""
    if focus_areas:
        focus_text = f"\n\nFocus on these areas: {', '.join(focus_areas)}"
    
    prompt = f"""Analyze the following {data_type} data and extract key insights:

{data_text}{focus_text}

Please provide:
1. Key findings
2. Recommendations
3. Risk assessment (if applicable)
4. Summary"""
    
    system_message = f"You are an expert {data_type} analyst. Provide clear, actionable insights."
    
    return await ai_client.generate_response(prompt, system_message)


async def compare_items(
    items: list, 
    comparison_type: str,
    criteria: Optional[list] = None
) -> str:
    """Compare multiple items using AI for decision support"""
    ai_client = get_ai_client()
    
    # Format items for comparison
    items_text = "\n\n".join([
        f"Item {i+1}:\n" + "\n".join([f"- {k}: {v}" for k, v in item.items()])
        for i, item in enumerate(items)
    ])
    
    criteria_text = ""
    if criteria:
        criteria_text = f"\n\nCompare based on: {', '.join(criteria)}"
    
    prompt = f"""Compare the following {comparison_type} items:

{items_text}{criteria_text}

Please provide:
1. Comparison analysis
2. Strengths and weaknesses of each
3. Recommendation
4. Summary"""
    
    system_message = f"You are an expert {comparison_type} analyst. Provide clear, objective comparisons."
    
    return await ai_client.generate_response(prompt, system_message)


async def generate_recommendations(
    context: str,
    recommendation_type: str,
    constraints: Optional[list] = None
) -> str:
    """Generate AI-powered recommendations for business decisions"""
    ai_client = get_ai_client()
    
    constraints_text = ""
    if constraints:
        constraints_text = f"\n\nConsider these constraints: {', '.join(constraints)}"
    
    prompt = f"""Based on the following context, generate {recommendation_type} recommendations:

{context}{constraints_text}

Please provide:
1. Primary recommendation with rationale
2. Alternative options
3. Implementation steps
4. Expected outcomes"""
    
    system_message = f"You are an expert business consultant specializing in {recommendation_type}. Provide strategic, actionable recommendations."
    
    return await ai_client.generate_response(prompt, system_message)


async def assess_risk(
    data: Dict[str, Any],
    risk_context: str,
    risk_factors: Optional[list] = None
) -> str:
    """Assess risks using AI for informed decision making"""
    ai_client = get_ai_client()
    
    data_text = "\n".join([f"{k}: {v}" for k, v in data.items()])
    
    factors_text = ""
    if risk_factors:
        factors_text = f"\n\nFocus on these risk factors: {', '.join(risk_factors)}"
    
    prompt = f"""Risk Assessment for: {risk_context}

Data to analyze:
{data_text}{factors_text}

Please provide:
1. Risk identification and categorization
2. Risk likelihood and impact assessment
3. Mitigation strategies
4. Risk monitoring recommendations"""
    
    system_message = f"You are an expert risk analyst. Provide comprehensive risk assessment with actionable mitigation strategies."
    
    return await ai_client.generate_response(prompt, system_message)


# Health check and monitoring
async def check_ai_health() -> Dict[str, Any]:
    """Check if AI functionality is working across the application"""
    try:
        ai_client = get_ai_client()
        # Simple test prompt
        response = await ai_client.generate_response("Say 'OK' if you're working", max_tokens=10)
        
        return {
            "status": "healthy",
            "provider": "gemini",
            "test_response": response.strip(),
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }


# Utility functions for common AI patterns
def create_system_prompt(expertise: str, task: str, output_format: Optional[str] = None) -> str:
    """Create consistent system prompts for AI interactions"""
    prompt = f"You are an expert {expertise}. Your task is to {task}."
    
    if output_format:
        prompt += f"\n\nPlease format your response as: {output_format}"
    
    prompt += "\n\nProvide clear, actionable insights that can be immediately used in business decisions."
    
    return prompt


def format_data_for_ai(data: Any, max_length: int = 500) -> str:
    """Format data consistently for AI analysis"""
    if isinstance(data, dict):
        formatted = []
        for key, value in data.items():
            if isinstance(value, (list, dict)):
                formatted.append(f"{key}: {str(value)[:max_length]}...")
            else:
                formatted.append(f"{key}: {value}")
        return "\n".join(formatted)
    elif isinstance(data, list):
        return "\n".join([f"Item {i+1}: {str(item)[:max_length]}" for i, item in enumerate(data)])
    else:
        return str(data)[:max_length]
