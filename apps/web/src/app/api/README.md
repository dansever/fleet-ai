# FleetAI API Structure

This directory contains the API routes organized by business logic domains.

## API Organization

### `/api/ai-chat/` - AI Chat Functionality

- **`/openai/`** - Direct OpenAI integration using AI SDK
- **`/langchain/`** - LangChain-powered chat with advanced capabilities

### `/api/document-extraction/` - Document Processing

- **`/upload/`** - Upload documents for extraction
- **`/extract/`** - Start document extraction job
- **`/agent/`** - Get extraction agent information
- **`/result/`** - Get extraction results
- **`/status/`** - Check extraction job status

### `/api/llama/` - LlamaCloud Integration (Legacy)

> **Note**: This folder contains the original LlamaCloud routes. Consider migrating to `/api/document-extraction/` for better organization.

## Business Logic Separation

Each API folder represents a distinct business domain:

1. **AI Chat** - Conversational AI functionality for user assistance
2. **Document Extraction** - Processing and extracting data from documents
3. **Other domains** - Add new folders as needed (e.g., `/api/fleet-management/`, `/api/fuel/`)

## Usage Examples

### AI Chat

```typescript
// OpenAI Chat
const response = await fetch('/api/ai-chat/openai', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});

// LangChain Chat
const response = await fetch('/api/ai-chat/langchain', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});
```

### Document Extraction

```typescript
// Upload document
const formData = new FormData();
formData.append('file', file);
const uploadResponse = await fetch('/api/document-extraction/upload', {
  method: 'POST',
  body: formData,
});

// Start extraction
const extractResponse = await fetch('/api/document-extraction/extract', {
  method: 'POST',
  body: JSON.stringify({ file_id, extraction_agent_id }),
});
```

## Migration Notes

- Old `/api/chat` route moved to `/api/ai-chat/openai`
- LlamaCloud routes should eventually be moved from `/api/llama` to `/api/document-extraction`
- Update all client-side code to use the new endpoints

## Benefits of This Structure

1. **Clear Separation** - Each business domain has its own namespace
2. **Scalability** - Easy to add new domains without conflicts
3. **Maintainability** - Related functionality is grouped together
4. **Team Collaboration** - Different teams can work on different domains
5. **API Discoverability** - Clear naming makes APIs self-documenting
