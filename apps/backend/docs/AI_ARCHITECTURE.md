# FleetAI Backend - AI Architecture

## 🚀 Quick Start for Developers

**How to use AI functionality throughout your application:**

### 1. **Text Analysis**

```python
from app.core.ai.ai_client import analyze_text

# Analyze any text content
result = await analyze_text(
    text="Your text content here",
    analysis_type="procurement analysis"
)
```

### 2. **Data Insights Extraction**

```python
from app.core.ai.ai_client import extract_insights

# Extract insights from structured data
result = await extract_insights(
    data={"price": 100, "vendor": "ABC Corp"},
    data_type="vendor evaluation",
    focus_areas=["pricing", "reliability"]
)
```

### 3. **Item Comparison**

```python
from app.core.ai.ai_client import compare_items

# Compare multiple items
result = await compare_items(
    items=[{"name": "Vendor A", "price": 100}, {"name": "Vendor B", "price": 120}],
    comparison_type="vendor comparison",
    criteria=["price", "quality", "delivery"]
)
```

### 4. **Business Recommendations**

```python
from app.core.ai.ai_client import generate_recommendations

# Generate strategic recommendations
result = await generate_recommendations(
    context="Current vendor performance data...",
    recommendation_type="vendor selection strategy",
    constraints=["budget", "timeline", "quality requirements"]
)
```

### 5. **Risk Assessment**

```python
from app.core.ai.ai_client import assess_risk

# Assess business risks
result = await assess_risk(
    data={"vendor_history": "...", "market_conditions": "..."},
    risk_context="new vendor onboarding",
    risk_factors=["financial_stability", "delivery_reliability", "quality_consistency"]
)
```

### 6. **Quote Analysis (Business Logic)**

```python
from app.services.quote_analysis_service import QuoteAnalysisService

service = QuoteAnalysisService()
result = await service.analyze_quotes_for_rfq("rfq_123")
```

### 7. **API Endpoints (Frontend Integration)**

- `POST /api/v1/ai/analyze-text` - Text analysis
- `POST /api/v1/ai/extract-insights` - Data insights
- `POST /api/v1/ai/compare-items` - Item comparison
- `POST /api/v1/ai/generate-recommendations` - Business recommendations
- `POST /api/v1/ai/assess-risk` - Risk assessment
- `POST /api/v1/ai/analyze-quotes` - Quote analysis
- `GET /api/v1/ai/health` - Health check
- `GET /api/v1/ai/capabilities` - Available features

---

## Overview

The FleetAI backend uses an **organized, simple yet powerful AI architecture** that provides comprehensive AI functionality throughout the entire application. This architecture is designed to be:

- ✅ **Organized** - Clear structure and consistent patterns
- ✅ **Simple** - Easy to understand and use
- ✅ **Powerful** - Comprehensive AI capabilities for business decisions
- ✅ **Application-wide** - Available throughout the entire system
- ✅ **Maintainable** - Clean, focused code without unnecessary complexity

## Architecture Structure

```
app/
├── core/
│   └── ai/
│       └── ai_client.py              # Central AI client with all capabilities
├── services/
│   └── quote_analysis_service.py     # Business logic using AI
└── api/
    └── ai_routes.py                  # REST API endpoints for AI functionality
```

## Core Components

### 1. AI Client (`app/core/ai/ai_client.py`)

**AIClient Class**

- Central AI client using Gemini
- Organized, professional implementation
- Simple async methods for text generation
- Global instance management

**Core AI Functions**

- `analyze_text()` - Analyze any text content
- `extract_insights()` - Extract insights from data
- `compare_items()` - Compare multiple items
- `generate_recommendations()` - Business recommendations
- `assess_risk()` - Risk assessment
- `check_ai_health()` - Health monitoring

**Utility Functions**

- `create_system_prompt()` - Consistent prompt creation
- `format_data_for_ai()` - Data formatting for AI analysis

### 2. Quote Analysis Service (`app/services/quote_analysis_service.py`)

- **Purpose**: Analyze quotes for RFQs using AI
- **Features**: Database queries + AI analysis
- **Usage**: `analyze_quotes_for_rfq(rfq_id)`
- **Integration**: Uses AI client for intelligent analysis

### 3. AI Routes (`app/api/ai_routes.py`)

- **Purpose**: Expose AI functionality via REST API
- **Features**: Clean endpoints with comprehensive request/response models
- **Coverage**: All AI capabilities available via HTTP

## AI Capabilities

### **Text Analysis**

- **Purpose**: Analyze any text content for insights
- **Use Cases**: Document analysis, report generation, content review
- **Features**: Customizable analysis types and system messages

### **Data Insights**

- **Purpose**: Extract insights from structured data
- **Use Cases**: Vendor performance analysis, market data interpretation
- **Features**: Focused analysis areas, actionable insights

### **Item Comparison**

- **Purpose**: Compare multiple items for decision support
- **Use Cases**: Vendor selection, product comparison, bid evaluation
- **Features**: Customizable comparison criteria, objective analysis

### **Business Recommendations**

- **Purpose**: Generate strategic recommendations
- **Use Cases**: Vendor strategy, procurement decisions, business planning
- **Features**: Context-aware analysis, constraint consideration

### **Risk Assessment**

- **Purpose**: Assess business risks using AI
- **Use Cases**: Vendor onboarding, contract evaluation, market analysis
- **Features**: Comprehensive risk factors, mitigation strategies

### **Quote Analysis**

- **Purpose**: Intelligent analysis of procurement quotes
- **Use Cases**: RFQ evaluation, vendor comparison, decision support
- **Features**: Database integration, structured insights

## Usage Patterns

### **1. Direct Function Calls**

```python
from app.core.ai.ai_client import analyze_text, extract_insights

# Simple, direct usage
analysis = await analyze_text("Vendor proposal...", "vendor evaluation")
insights = await extract_insights(data, "performance analysis")
```

### **2. Service Integration**

```python
from app.services.quote_analysis_service import QuoteAnalysisService

# Business logic with AI
service = QuoteAnalysisService()
result = await service.analyze_quotes_for_rfq("rfq_456")
```

### **3. API Integration**

```typescript
// Frontend integration
const response = await fetch('/api/v1/ai/analyze-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Analyze this vendor proposal...',
    analysis_type: 'vendor evaluation',
  }),
});
```

## Architecture Benefits

### 🎯 **Developer Experience**

- **Clear organization** - All AI functionality in one place
- **Consistent patterns** - Same approach for all AI operations
- **Easy integration** - Simple imports and function calls
- **Comprehensive coverage** - All AI needs covered

### 🚀 **Performance & Reliability**

- **Single client instance** - Efficient resource management
- **Async operations** - Non-blocking AI processing
- **Error handling** - Graceful fallbacks and logging
- **Health monitoring** - System status tracking

### 🔧 **Maintainability**

- **Centralized logic** - Easy to modify and extend
- **Clear separation** - Business logic vs. AI capabilities
- **Consistent interfaces** - Predictable function signatures
- **Professional structure** - Enterprise-grade organization

### 📚 **Scalability**

- **Modular design** - Easy to add new AI capabilities
- **Reusable patterns** - Common functions for similar tasks
- **API-first approach** - Frontend and backend integration
- **Extensible architecture** - Ready for future enhancements

## Integration Examples

### **Vendor Management**

```python
from app.core.ai.ai_client import extract_insights, assess_risk

# Analyze vendor performance
performance_insights = await extract_insights(
    data=vendor_performance_data,
    data_type="vendor performance",
    focus_areas=["reliability", "quality", "cost"]
)

# Assess vendor risks
risk_assessment = await assess_risk(
    data=vendor_data,
    risk_context="vendor selection",
    risk_factors=["financial_stability", "delivery_reliability"]
)
```

### **Procurement Decisions**

```python
from app.core.ai.ai_client import compare_items, generate_recommendations

# Compare vendor proposals
comparison = await compare_items(
    items=vendor_proposals,
    comparison_type="vendor proposal",
    criteria=["price", "quality", "delivery", "warranty"]
)

# Generate procurement strategy
strategy = await generate_recommendations(
    context="Current market conditions and vendor landscape...",
    recommendation_type="procurement strategy",
    constraints=["budget", "timeline", "quality_requirements"]
)
```

### **Market Analysis**

```python
from app.core.ai.ai_client import analyze_text, extract_insights

# Analyze market reports
market_analysis = await analyze_text(
    text=market_report_content,
    analysis_type="market trend analysis"
)

# Extract insights from market data
market_insights = await extract_insights(
    data=market_data,
    data_type="market analysis",
    focus_areas=["trends", "opportunities", "risks"]
)
```

## Configuration

### Environment Variables

```bash
# Required for AI functionality
GEMINI_API_KEY=your_gemini_api_key
```

### Dependencies

```bash
# Core requirements
pip install google-generativeai fastapi
```

## Best Practices

### **1. Consistent Usage**

- Use the same AI functions throughout the application
- Follow established patterns for similar tasks
- Leverage utility functions for common operations

### **2. Error Handling**

- Always handle AI function errors gracefully
- Provide fallback responses when AI is unavailable
- Log errors for debugging and monitoring

### **3. Performance Optimization**

- Use appropriate token limits for different tasks
- Cache AI responses when appropriate
- Batch similar AI requests when possible

### **4. Data Preparation**

- Use `format_data_for_ai()` for consistent data formatting
- Provide clear context and focus areas
- Structure data logically for better AI analysis

## Future Enhancements

### **1. Advanced AI Models**

- Easy integration of additional AI providers
- Model selection based on task requirements
- Performance optimization for different use cases

### **2. Caching & Optimization**

- Response caching for repeated queries
- Intelligent prompt optimization
- Batch processing capabilities

### **3. Advanced Analytics**

- AI-powered trend analysis
- Predictive insights
- Automated reporting

### **4. Integration Features**

- Webhook support for async processing
- Real-time AI streaming
- Advanced monitoring and analytics

## Troubleshooting

### Common Issues

1. **Missing API Key**

   ```
   ValueError: GEMINI_API_KEY environment variable is required
   ```

   **Solution**: Set the `GEMINI_API_KEY` environment variable

2. **Import Errors**

   ```
   ImportError: No module named 'google.generativeai'
   ```

   **Solution**: Install with `pip install google-generativeai`

3. **AI Generation Failures**
   ```
   Analysis temporarily unavailable: [error message]
   ```
   **Solution**: Check Gemini API key and internet connection

### Debug Mode

```python
import logging
logging.getLogger("app.core.ai").setLevel(logging.DEBUG)
```

## Support

For issues and questions about the AI architecture:

1. **Check the logs** for detailed error information
2. **Verify API key** using `/api/v1/ai/health` endpoint
3. **Review function signatures** in `ai_client.py`
4. **Check dependencies** are properly installed

---

## Summary

The FleetAI AI architecture provides:

- **Organized structure** - Clear, professional organization
- **Simple usage** - Easy-to-understand function calls
- **Powerful capabilities** - Comprehensive AI functionality
- **Application-wide access** - Available throughout the system
- **Enterprise-ready** - Professional, maintainable code

This architecture follows **best practices for AI integration** while maintaining simplicity and power for your entire application.
