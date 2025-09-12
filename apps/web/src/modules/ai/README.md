# AI Module

A comprehensive AI module for Fleet AI that provides clean, type-safe interfaces for AI operations following LangChain/OpenAI patterns.

## Architecture Overview

The AI module is organized into focused sub-modules:

```
modules/ai/
├── types.ts              # Core AI types and interfaces
├── chat/                 # Chat and conversation functionality
│   ├── chat.client.ts   # Enhanced chat client with streaming
│   └── index.ts         # Chat module exports
├── extract/             # Document extraction functionality
│   ├── extract.client.ts
│   ├── extract.server.ts
│   ├── extract.types.ts
│   └── index.ts
├── ai.client.ts         # Legacy client (deprecated)
├── index.ts             # Main module exports
└── README.md           # This file
```

## Key Features

### 🎯 Type Safety

- Comprehensive TypeScript types based on backend LLM schemas
- Generic `LLMResult<T>` type for flexible response handling
- Proper enum definitions following OpenAI/LangChain standards

### 🚀 Enhanced Chat Client

- **Streaming Support**: Real-time response streaming with async generators
- **Error Handling**: Robust error handling with proper error types
- **Timeout Management**: Configurable request timeouts
- **Usage Tracking**: Automatic token usage tracking and estimation
- **Backward Compatibility**: Legacy function support during migration

### 📊 Token Usage

- Accurate token counting from server responses
- Fallback estimation for client-side calculations
- Usage metrics for cost tracking and optimization

### 🔄 Streaming

- Server-sent events (SSE) streaming support
- Async generator pattern for real-time responses
- Proper stream cleanup and error handling

## Usage Examples

### Basic Chat

```typescript
import { chatClient } from '@/modules/ai/chat';

// Simple prompt
const result = await chatClient.sendPrompt('Hello, how can you help me?');
console.log(result.content); // AI response
console.log(result.usage); // Token usage

// With options
const result = await chatClient.sendPrompt('Analyze this data', {
  model: 'gpt-4',
  temperature: 0.7,
  systemPrompt: 'You are a data analyst expert.',
});
```

### Streaming Responses

```typescript
import { chatClient } from '@/modules/ai/chat';

// Using async generator
const request = {
  messages: [{ role: 'user', parts: [{ type: 'text', text: 'Write a story' }] }],
};

for await (const chunk of chatClient.streamChatCompletion(request)) {
  if (chunk.type === 'text-delta') {
    process.stdout.write(chunk.textDelta);
  } else if (chunk.type === 'usage') {
    console.log('Final usage:', chunk.usage);
  }
}
```

### Advanced Chat Completion

```typescript
import { chatClient, MessageRole } from '@/modules/ai/chat';

const result = await chatClient.sendChatCompletion({
  messages: [
    {
      role: 'system',
      parts: [{ type: 'text', text: 'You are a helpful assistant.' }],
    },
    {
      role: 'user',
      parts: [{ type: 'text', text: 'What is the capital of France?' }],
    },
  ],
  model: 'gpt-4',
  temperature: 0.3,
  maxTokens: 150,
});
```

### Error Handling

```typescript
import { chatClient, AIError } from '@/modules/ai/chat';

try {
  const result = await chatClient.sendPrompt('Hello');
} catch (error) {
  const aiError = error as AIError;
  console.error(`AI Error [${aiError.code}]: ${aiError.message}`);

  if (aiError.code === 'TIMEOUT') {
    console.log('Request timed out, try again');
  } else if (aiError.code.startsWith('HTTP_')) {
    console.log('Server error:', aiError.details);
  }
}
```

## Types Reference

### Core Types

- **`LLMResult<T>`**: Generic result type with content, usage, and metadata
- **`Usage`**: Token usage metrics (input, output, total)
- **`LLMMessage`**: Individual message in conversation
- **`LLMParams`**: Parameters for LLM generation calls
- **`StreamChunk`**: Streaming response chunk
- **`AIError`**: Standardized error interface

### Enums

- **`MessageRole`**: System, User, Assistant, Tool
- **`ModelProvider`**: OpenAI, Gemini, Llama

## Migration Guide

### From Legacy `ai.client.ts`

```typescript
import { chatClient } from '@/modules/ai/chat';
const result = await chatClient.sendPrompt('Hello');
```

### From Direct API Calls

```typescript
// Old way
const response = await fetch('/api/ai-chat/langchain', {
  method: 'POST',
  body: JSON.stringify({ messages: [...] })
});

// New way
import { chatClient } from '@/modules/ai/chat';
const result = await chatClient.sendChatCompletion({
  messages: [...]
});
```

## Configuration

The chat client can be configured with custom settings:

```typescript
import { ChatClient } from '@/modules/ai/chat';

const customClient = new ChatClient('/api/custom-ai', 60000); // Custom URL and timeout
```

## Best Practices

1. **Use Streaming for Long Responses**: Enable streaming for better user experience
2. **Handle Errors Gracefully**: Always wrap AI calls in try-catch blocks
3. **Monitor Token Usage**: Track usage for cost optimization
4. **Set Appropriate Timeouts**: Configure timeouts based on expected response time
5. **Use Type Safety**: Leverage TypeScript types for better development experience

## Backend Integration

This module integrates with the backend AI system:

- **Backend Schema Alignment**: Types match backend LLM schemas
- **Token Usage Tracking**: Automatic usage recording via `/services/record-usage`
- **Model Configuration**: Respects backend AI configuration and model selection
- **Error Propagation**: Proper error handling from backend to frontend

## Future Enhancements

- **Tool/Function Calling**: Support for AI function calling
- **Multi-modal Support**: Image and file input support
- **Conversation Management**: Built-in conversation history management
- **Caching**: Response caching for improved performance
- **Retry Logic**: Automatic retry with exponential backoff
