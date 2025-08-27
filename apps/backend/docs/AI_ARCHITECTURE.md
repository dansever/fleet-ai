# FleetAI Backend - AI Architecture

## Overview

The FleetAI backend has been reorganized with a clean, hierarchical AI architecture that provides unified interfaces for different AI use cases. This architecture follows best practices for modularity, extensibility, and maintainability.

## Architecture Structure

```
app/
├── core/
│   └── ai/                    # Core AI functionality
│       ├── __init__.py        # Main AI module exports
│       ├── base.py            # Base AI service interfaces
│       └── llm/               # LLM-specific functionality
│           ├── __init__.py    # LLM module exports
│           ├── provider.py    # Abstract LLM provider interface
│           └── router.py      # LLM provider routing and registry
├── services/
│   ├── ai/                    # Business logic AI services
│   │   ├── __init__.py        # AI services exports
│   │   ├── document_extraction_service.py
│   │   └── vendor_analysis_service.py
│   ├── ai_service_manager.py  # Unified AI service manager
│   ├── quote_analysis_service.py  # Quote analysis (updated)
│   └── llm/                   # Legacy LLM services (updated)
│       ├── llm_runner.py      # Updated LLM runner
│       └── providers/         # LLM provider implementations
│           ├── gemini_service.py    # Updated Gemini provider
│           └── openai_service.py    # Updated OpenAI provider
└── api/
    └── ai_routes.py           # AI service API endpoints
```

## Core Components

### 1. AI Base Classes (`app/core/ai/base.py`)

#### `AIServiceBase`

- Abstract base class for all AI services
- Provides common functionality and interface
- Methods: `process_request()`, `validate_input()`, `format_response()`, `get_service_info()`

#### `LLMServiceBase`

- Inherits from `AIServiceBase`
- Provides LLM-specific functionality
- Methods: `generate_llm_response()`, `create_system_prompt()`, `create_analysis_prompt()`

### 2. LLM Provider Interface (`app/core/ai/llm/provider.py`)

#### `LLMProvider`

- Abstract interface for LLM providers
- All providers must implement: `generate_response()`, `health_check()`
- Provides validation, prompt formatting, and provider information

### 3. LLM Router (`app/core/ai/llm/router.py`)

- Manages LLM provider registration and routing
- Provides fallback mechanisms for unavailable providers
- Auto-registers available providers on import
- Functions: `get_llm_provider()`, `register_llm_provider()`, `get_available_providers()`

## AI Services

### 1. Document Extraction Service

- **Purpose**: Extract structured data from various document types
- **Supported Types**: Fuel bids, RFQs, quotes, general documents
- **Features**: Custom extraction schemas, LLM-powered analysis
- **Usage**: `extract_document(document_type, content, schema)`

### 2. Vendor Analysis Service

- **Purpose**: Analyze vendor performance and provide insights
- **Features**: Performance metrics, risk assessment, vendor comparison
- **Usage**: `analyze_vendor(vendor_id, analysis_type)`, `compare_vendors(vendor_ids)`

### 3. Quote Analysis Service (Updated)

- **Purpose**: Analyze quotes for RFQs and provide recommendations
- **Features**: LLM-powered analysis, structured insights, quote comparison
- **Usage**: `analyze_quotes_for_rfq(rfq_id)`

## AI Service Manager

The `AIServiceManager` provides a unified interface to all AI services:

```python
from app.services.ai_service_manager import get_ai_service_manager

ai_manager = get_ai_service_manager()

# Extract document data
result = await ai_manager.extract_document("fuel_bid", document_content)

# Analyze vendor
result = await ai_manager.analyze_vendor("vendor_123", "comprehensive")

# Analyze quotes
result = await ai_manager.analyze_quotes_for_rfq("rfq_456")

# Compare vendors
result = await ai_manager.compare_vendors(["vendor_123", "vendor_456"])
```

## LLM Providers

### Gemini Provider

- **Model**: Gemini 1.5 Flash (configurable)
- **Features**: Structured output, JSON schema support, token usage tracking
- **Configuration**: Set via `GEMINI_API_KEY` environment variable

### OpenAI Provider

- **Model**: GPT-4 (configurable)
- **Features**: Chat completion, structured output, token usage tracking
- **Configuration**: Set via `OPENAI_API_KEY` environment variable

## API Endpoints

The AI services are exposed through RESTful API endpoints:

- `POST /ai/extract-document` - Document extraction
- `POST /ai/analyze-vendor` - Vendor analysis
- `POST /ai/analyze-quotes` - Quote analysis
- `POST /ai/compare-vendors` - Vendor comparison
- `GET /ai/services` - List available services
- `GET /ai/health` - Service health status
- `POST /ai/process-request` - Generic service request

## Usage Examples

### 1. Document Extraction

```python
from app.services.ai_service_manager import extract_document

# Extract fuel bid data
result = await extract_document(
    document_type="fuel_bid",
    content="Fuel bid document content...",
    extraction_schema={
        "vendor_name": "Name of the fuel vendor",
        "fuel_type": "Type of fuel",
        "price_per_unit": "Price per unit"
    }
)
```

### 2. Vendor Analysis

```python
from app.services.ai_service_manager import analyze_vendor

# Analyze vendor performance
result = await analyze_vendor(
    vendor_id="vendor_123",
    analysis_type="comprehensive"
)
```

### 3. Quote Analysis

```python
from app.services.ai_service_manager import analyze_quotes_for_rfq

# Analyze quotes for an RFQ
result = await analyze_quotes_for_rfq("rfq_456")
```

### 4. Direct LLM Usage

```python
from app.core.ai.llm.router import get_llm_provider

# Get LLM provider
llm_provider = get_llm_provider()

# Generate response
response = await llm_provider.generate_response(
    LLMRequest(
        prompt="Your prompt here",
        max_output_tokens=1000,
        temperature=0.1
    )
)
```

## Configuration

### Environment Variables

```bash
# LLM Provider Configuration
ACTIVE_LLM_PROVIDER=gemini  # Default provider
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Model Configuration
ACTIVE_GEMINI_MODEL=gemini-1.5-flash
```

### Adding New LLM Providers

1. Create a new provider class implementing `LLMProvider`
2. Add it to the auto-registration in `router.py`
3. Update configuration as needed

```python
class NewProvider(LLMProvider):
    async def generate_response(self, request: LLMRequest) -> LLMResponse:
        # Implementation here
        pass

    async def health_check(self) -> bool:
        # Health check implementation
        pass
```

## Error Handling

The architecture provides comprehensive error handling:

- **Service Level**: Each service handles its own errors gracefully
- **Manager Level**: The AI service manager catches and formats errors
- **API Level**: HTTP status codes and error messages for client consumption
- **LLM Level**: Provider fallback and health checks

## Best Practices

### 1. Service Design

- Inherit from appropriate base classes
- Implement the `process_request()` method
- Use the base class helper methods for common tasks

### 2. LLM Usage

- Use structured prompts with system messages
- Implement proper error handling and fallbacks
- Monitor token usage and costs

### 3. API Design

- Use consistent request/response models
- Implement proper validation
- Provide meaningful error messages

### 4. Testing

- Test each service independently
- Mock LLM responses for unit tests
- Test error scenarios and edge cases

## Migration Guide

### From Old Structure

1. **Update imports**: Use new AI core modules
2. **Service inheritance**: Inherit from `LLMServiceBase` instead of custom classes
3. **LLM calls**: Use `generate_llm_response()` method from base class
4. **Error handling**: Use the new error handling patterns

### Example Migration

**Before:**

```python
from app.core.llm.router import get_llm_provider

class OldService:
    def __init__(self):
        self.llm_provider = get_llm_provider()

    async def analyze(self, data):
        response = await self.llm_provider.generate_response(prompt)
        return response
```

**After:**

```python
from app.core.ai.base import LLMServiceBase

class NewService(LLMServiceBase):
    def __init__(self):
        super().__init__("service_name", default_model="gemini-1.5-flash")

    async def process_request(self, request):
        response = await self.generate_llm_response(
            prompt=request["prompt"],
            system_message=request.get("system")
        )
        return response
```

## Future Enhancements

1. **Streaming Support**: Add streaming responses for long-running operations
2. **Caching**: Implement response caching for repeated queries
3. **Rate Limiting**: Add rate limiting per service and user
4. **Metrics**: Enhanced usage tracking and analytics
5. **Plugin System**: Allow dynamic service registration
6. **Multi-Modal Support**: Support for images, documents, and other media types

## Troubleshooting

### Common Issues

1. **Provider Not Available**: Check API keys and provider health
2. **Service Not Found**: Verify service registration in `AIServiceManager`
3. **Import Errors**: Ensure all dependencies are properly installed
4. **LLM Failures**: Check provider health and fallback mechanisms

### Debug Mode

Enable debug logging to see detailed information about service operations:

```python
import logging
logging.getLogger("app.core.ai").setLevel(logging.DEBUG)
```

## Support

For issues and questions about the AI architecture:

1. Check the logs for detailed error information
2. Verify service health using `/ai/health` endpoint
3. Review the service manager status
4. Check LLM provider availability and configuration
