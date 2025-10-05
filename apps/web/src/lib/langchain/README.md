# LangChain Framework - FleetAI

> A modular, type-safe LangChain implementation for AI-powered conversational interfaces and structured data extraction.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Architecture](#architecture)
- [Module Reference](#module-reference)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This framework provides a **clean abstraction layer** over LangChain, enabling you to:

- Build conversational AI agents with chat history
- Extract structured data using Zod schemas
- Stream responses token-by-token for better UX
- Handle errors gracefully with user-friendly messages
- Track token usage across multi-turn conversations
- Integrate RAG (Retrieval-Augmented Generation) workflows

### Why This Architecture?

Instead of scattering LangChain logic across your codebase, this framework:

1. **Centralizes** model configuration and creation
2. **Standardizes** prompt templates for consistency
3. **Simplifies** streaming and structured output patterns
4. **Encapsulates** error handling and usage tracking
5. **Enables** easy provider switching (OpenAI, Anthropic, etc.)

---

## Core Concepts

### What is LangChain?

[LangChain](https://langchain-ai.github.io/langgraphjs/) is a framework for building applications with Large Language Models (LLMs). Key concepts:

- **Runnable**: Any object that can process input → output (models, chains, prompts)
- **Chain**: A sequence of runnables (prompt → model → parser)
- **Messages**: Structured conversation units (HumanMessage, AIMessage, SystemMessage)
- **Streaming**: Token-by-token output instead of waiting for full completion
- **Structured Output**: Force LLM to return validated JSON/objects

### How It Works in FleetAI

```
User Input
    ↓
[ Messages ] → [ Prompt Template ] → [ LLM Model ] → [ Parser ]
    ↓                                                      ↓
Chat History                                      Structured/Raw Output
```

---

## Architecture

### File Structure

```
lib/langchain/
├── index.ts              # Central exports
├── types.ts              # TypeScript type definitions
├── errors.ts             # Error formatting utilities
├── model.ts              # Model creation & configuration
├── messages.ts           # Message format converters
├── prompts.ts            # Prompt templates
├── chains.ts             # Pre-built conversation chains
├── structured.ts         # Structured output helpers
├── streaming.ts          # Streaming utilities
├── usage.ts              # Token usage tracking
└── providers/
    ├── openai.ts         # OpenAI-specific implementations
    └── openaidemo.ts     # Usage examples & demos
```

---

## Module Reference

### 📦 `index.ts` - Central Exports

**Purpose**: Single entry point for all framework utilities.

```typescript
import { createChatModel, makeConversationChain, streamToCallbacks } from '@/lib/langchain';
```

---

### 🔧 `model.ts` - Model Creation

**Purpose**: Create and configure LLM instances with sensible defaults.

#### Main Functions

##### `createChatModel(config?)`

Creates a ChatOpenAI instance with optimized settings.

```typescript
import { createChatModel } from '@/lib/langchain';

// Use defaults (gpt-4o-mini, temp=0.7)
const model = createChatModel();

// Custom configuration
const model = createChatModel({
  model: 'gpt-4o',
  temperature: 0.9,
  maxTokens: 2000,
  timeout: 30000,
  maxRetries: 3,
});
```

**Config Options:**

- `model`: Model identifier (default: `'gpt-4o-mini'`)
- `temperature`: Randomness 0-2 (default: `0.7`)
- `maxTokens`: Max output tokens
- `timeout`: Request timeout in ms
- `maxRetries`: Retry attempts on failure

##### `createResponsesModel(config?)`

Uses OpenAI's Responses API for advanced outputs (tool outputs, reasoning summaries).

```typescript
const model = createResponsesModel({
  model: 'gpt-4o-mini',
  temperature: 0,
});
```

---

### 💬 `messages.ts` - Message Conversion

**Purpose**: Convert between UI message formats and LangChain message types.

#### Function: `toLCMessages(messages)`

```typescript
import { toLCMessages } from '@/lib/langchain';

const uiMessages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'system', content: 'You are helpful.' },
];

const lcMessages = toLCMessages(uiMessages);
// Returns: [HumanMessage('Hello!'), AIMessage('Hi there!'), SystemMessage('You are helpful.')]
```

**Supports:**

- `role: 'user'` → `HumanMessage`
- `role: 'assistant'` → `AIMessage`
- `role: 'system'` → `SystemMessage`
- `parts` array for multi-part messages (extracts text parts)

---

### 📝 `prompts.ts` - Prompt Templates

**Purpose**: Standardized prompts for FleetAI domain expertise.

#### Constants

##### `FLEET_AI_SYSTEM_PROMPT`

The core system prompt defining FleetAI Assistant's persona and expertise.

**Key features:**

- Aviation and fleet management expertise
- Professional communication style
- Safety and compliance awareness
- Context-aware responses

#### Functions

##### `makeConversationPrompt()`

Creates a prompt template with chat history support.

```typescript
import { makeConversationPrompt } from '@/lib/langchain';

const prompt = makeConversationPrompt();
// Structure: [SystemMessage, MessagesPlaceholder('chat_history'), HumanMessage('{input}')]
```

##### `makeSingleTurnPrompt()`

Creates a simple single-turn prompt (no history).

```typescript
import { makeSingleTurnPrompt } from '@/lib/langchain';

const prompt = makeSingleTurnPrompt();
// Structure: [SystemMessage, HumanMessage('{input}')]
```

---

### ⛓️ `chains.ts` - Pre-built Chains

**Purpose**: Composable chains for common patterns.

#### Functions

##### `makeConversationChain()`

Full conversation chain with string output.

```typescript
import { makeConversationChain } from '@/lib/langchain';

const chain = makeConversationChain();

const response = await chain.invoke({
  input: 'What is aircraft ETOPS?',
  chat_history: previousMessages,
});
// Returns: string
```

**Flow:** `Input + History → Prompt → Model → StringOutputParser`

##### `makeRawConversationChain()`

Conversation chain that returns raw AIMessageChunk (includes metadata).

```typescript
import { makeRawConversationChain } from '@/lib/langchain';

const chain = makeRawConversationChain();

const response = await chain.invoke({
  input: 'Explain fuel hedging',
  chat_history: [],
});

console.log(response.content); // The message text
console.log(response.usage_metadata); // Token usage
```

**Flow:** `Input + History → Prompt → Model` (no parser)

##### `makeSingleTurnChain()`

Simple one-shot question chain.

```typescript
import { makeSingleTurnChain } from '@/lib/langchain';

const chain = makeSingleTurnChain();
const response = await chain.invoke({
  input: 'Define MEL in aviation',
});
```

##### `makeRAGChain(retriever)`

Retrieval-Augmented Generation chain.

```typescript
import { makeRAGChain } from '@/lib/langchain';

const retriever = {
  getRelevantDocuments: async (query: string) => {
    // Your vector search logic
    return [{ pageContent: 'Document content...' }];
  },
};

const chain = makeRAGChain(retriever);
const response = await chain.invoke({
  input: 'What are our maintenance policies?',
});
```

**Flow:** `Input → Retrieve Docs → Inject Context → Prompt → Model`

---

### 🎯 `structured.ts` - Structured Output

**Purpose**: Extract structured data with Zod schema validation.

#### Functions

##### `makeStructuredRunnable(schema, config?)`

Force LLM to return validated objects.

```typescript
import { makeStructuredRunnable } from '@/lib/langchain';
import { z } from 'zod';

const FlightPlan = z.object({
  flightNumber: z.string(),
  departure: z.string(),
  arrival: z.string(),
  estimatedDuration: z.number().describe('Duration in minutes'),
});

const extractor = makeStructuredRunnable(FlightPlan, {
  model: 'gpt-4o',
  temperature: 0,
});

const result = await extractor.invoke([
  ['system', 'Extract flight plan from text'],
  ['human', 'AA123 flies LAX to JFK, about 5 hours'],
]);

console.log(result);
// { flightNumber: 'AA123', departure: 'LAX', arrival: 'JFK', estimatedDuration: 300 }
```

##### `makeJsonModeRunnable(schema)`

Returns both parsed object and raw message.

```typescript
import { makeJsonModeRunnable } from '@/lib/langchain';

const extractor = makeJsonModeRunnable(FlightPlan);
const { parsed, raw } = await extractor.invoke(messages);

console.log(parsed); // Validated object
console.log(raw.usage_metadata); // Token usage
```

---

### 🌊 `streaming.ts` - Streaming Utilities

**Purpose**: Stream LLM responses token-by-token for real-time UX.

#### Function: `streamToCallbacks(runnable, input, opts)`

```typescript
import { streamToCallbacks } from '@/lib/langchain';
import { makeSingleTurnChain } from '@/lib/langchain';

const chain = makeSingleTurnChain();

await streamToCallbacks(
  chain,
  { input: 'Explain aircraft weight and balance' },
  {
    onToken: (token) => {
      process.stdout.write(token); // Real-time display
    },
    onFinal: (fullMessage, usage) => {
      console.log('\n\nTokens used:', usage);
    },
    onError: (error) => {
      console.error('Stream error:', error);
    },
  },
);
```

**Use Cases:**

- Server-Sent Events (SSE) endpoints
- Real-time chat interfaces
- Progress indicators for long responses

---

### 📊 `usage.ts` - Token Tracking

**Purpose**: Track and accumulate token usage across requests.

#### Types

```typescript
type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
};
```

#### Functions

##### `getUsageFromMessage(message)`

Extract usage from AIMessage or AIMessageChunk.

```typescript
import { getUsageFromMessage } from '@/lib/langchain';

const usage = getUsageFromMessage(aiMessage);
console.log(`Used ${usage.total_tokens} tokens`);
```

##### `UsageAccumulator`

Accumulate usage across multiple LLM calls.

```typescript
import { UsageAccumulator } from '@/lib/langchain';

const accumulator = new UsageAccumulator();

// After first call
accumulator.add(getUsageFromMessage(response1));

// After second call
accumulator.add(getUsageFromMessage(response2));

console.log(accumulator.total);
// { input_tokens: 450, output_tokens: 320, total_tokens: 770 }
```

---

### ⚠️ `errors.ts` - Error Handling

**Purpose**: Convert technical errors into user-friendly messages.

#### Function: `formatChainError(error)`

```typescript
import { formatChainError } from '@/lib/langchain';

try {
  await chain.invoke(input);
} catch (error) {
  const userMessage = formatChainError(error);
  console.error(userMessage);
  // "High demand right now. Please retry shortly." (for rate limits)
  // "The request timed out. Try a shorter query or retry." (for timeouts)
  // "Something went wrong. Please retry or rephrase your question." (generic)
}
```

---

### 🔌 `providers/openai.ts` - OpenAI Provider

**Purpose**: OpenAI-specific implementations and helpers.

#### Functions

##### `createOpenAIAgent(options?)`

Direct OpenAI model creator with fine-grained control.

```typescript
import { createOpenAIAgent } from '@/lib/langchain/providers/openai';

const model = createOpenAIAgent({
  model: 'gpt-4o',
  temperature: 0.8,
  maxTokens: 1500,
  streamUsage: true,
});
```

##### `createStructuredRunnable(schema, opts?)`

Provider-optimized structured output.

```typescript
import { createStructuredRunnable } from '@/lib/langchain/providers/openai';
import { z } from 'zod';

const schema = z.object({
  /* ... */
});
const extractor = createStructuredRunnable(schema, {
  model: 'gpt-4o',
  temperature: 0,
});
```

##### `bindTools(llm, tools, toolOptions?)`

Enable function/tool calling.

```typescript
import { createOpenAIAgent, bindTools } from '@/lib/langchain/providers/openai';
import { z } from 'zod';

const llm = createOpenAIAgent();

const tools = [
  {
    name: 'searchFlights',
    description: 'Search for flights by criteria',
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
      date: z.string(),
    }),
  },
];

const llmWithTools = bindTools(llm, tools, {
  tool_choice: 'auto',
  parallel_tool_calls: true,
});

const response = await llmWithTools.invoke('Find flights from LAX to JFK tomorrow');

if (response.tool_calls?.length) {
  // Handle tool execution
  const toolCall = response.tool_calls[0];
  console.log('Tool:', toolCall.name);
  console.log('Args:', toolCall.args);
}
```

##### `streamRunnable(runnable, input, config?)`

Stream any runnable.

```typescript
import { streamRunnable } from '@/lib/langchain/providers/openai';

const stream = await streamRunnable(chain, { input: 'Hello' });

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

##### `streamOpenAI(input, options?)`

Quick single-turn streaming.

```typescript
import { streamOpenAI } from '@/lib/langchain/providers/openai';

// String input (single human turn)
const stream = await streamOpenAI('What is ICAO?', {
  temperature: 0.7,
  model: 'gpt-4o-mini',
});

// Or message array
const stream = await streamOpenAI(
  [
    ['system', 'You are FleetAI'],
    ['human', 'Explain RVSM'],
  ],
  { temperature: 0.5 },
);

for await (const chunk of stream) {
  process.stdout.write(chunk.content as string);
}
```

---

### 📚 `providers/openaidemo.ts` - Examples

**Purpose**: Complete working examples for each pattern.

Run the demos to see live examples:

```typescript
import { runOpenAIDemo } from '@/lib/langchain/providers/openaidemo';

runOpenAIDemo().catch(console.error);
```

**Includes:**

- Basic streaming
- Prompt + model chains
- Structured output extraction
- JSON mode with raw message
- Tool calling patterns

---

## Usage Examples

### Example 1: Simple Chatbot

```typescript
import { makeConversationChain, toLCMessages } from '@/lib/langchain';

const chain = makeConversationChain();

// Convert UI messages to LangChain format
const history = toLCMessages([
  { role: 'user', content: 'What is ETOPS?' },
  {
    role: 'assistant',
    content: 'ETOPS stands for Extended-range Twin-engine Operations Performance Standards...',
  },
]);

const response = await chain.invoke({
  input: 'Why is it important?',
  chat_history: history,
});

console.log(response); // String response
```

### Example 2: Streaming Chat with Usage Tracking

```typescript
import {
  makeRawConversationChain,
  streamToCallbacks,
  UsageAccumulator,
  getUsageFromMessage,
} from '@/lib/langchain';

const chain = makeRawConversationChain();
const usage = new UsageAccumulator();

await streamToCallbacks(
  chain,
  { input: 'Explain fuel tankering', chat_history: [] },
  {
    onToken: (token) => {
      // Send to frontend via SSE
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    },
    onFinal: (message, usageData) => {
      usage.add(usageData);
      console.log('Total usage:', usage.total);
    },
    onError: (error) => {
      const msg = formatChainError(error);
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    },
  },
);
```

### Example 3: Extract Structured Data from Documents

```typescript
import { makeStructuredRunnable } from '@/lib/langchain';
import { z } from 'zod';

const InvoiceSchema = z.object({
  invoiceNumber: z.string(),
  date: z.string(),
  vendor: z.string(),
  total: z.number(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
});

const extractor = makeStructuredRunnable(InvoiceSchema, {
  model: 'gpt-4o',
  temperature: 0,
});

const invoice = await extractor.invoke([
  ['system', 'Extract invoice data. Return only the structured object.'],
  ['human', documentText],
]);

console.log(invoice);
// Fully typed and validated!
```

### Example 4: RAG with Document Search

```typescript
import { makeRAGChain } from '@/lib/langchain';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

const vectorStore = new SupabaseVectorStore(/* config */);

const retriever = {
  getRelevantDocuments: async (query: string) => {
    const results = await vectorStore.similaritySearch(query, 5);
    return results.map((doc) => ({ pageContent: doc.pageContent }));
  },
};

const ragChain = makeRAGChain(retriever);

const answer = await ragChain.invoke({
  input: 'What are our aircraft maintenance policies?',
});

console.log(answer);
// Response will include context from retrieved documents
```

### Example 5: Multi-Agent with Tools

```typescript
import { createOpenAIAgent, bindTools } from '@/lib/langchain/providers/openai';
import { z } from 'zod';

const llm = createOpenAIAgent({ temperature: 0 });

const tools = [
  {
    name: 'getFuelPrice',
    description: 'Get current fuel price at an airport',
    schema: z.object({
      icao: z.string().describe('ICAO airport code'),
    }),
  },
  {
    name: 'getWeather',
    description: 'Get current weather at an airport',
    schema: z.object({
      icao: z.string().describe('ICAO airport code'),
    }),
  },
];

const agent = bindTools(llm, tools, { tool_choice: 'auto' });

const response = await agent.invoke('What is the fuel price and weather at KJFK?');

// Handle tool calls
for (const toolCall of response.tool_calls || []) {
  const result = await executeToolCall(toolCall);
  // Continue conversation with tool result...
}
```

---

## Best Practices

### 1. **Use the Right Chain for Your Use Case**

- **Simple Q&A**: `makeSingleTurnChain()`
- **Chat with history**: `makeConversationChain()`
- **Need metadata/usage**: `makeRawConversationChain()`
- **Document search**: `makeRAGChain()`
- **Data extraction**: `makeStructuredRunnable()`

### 2. **Always Track Token Usage**

```typescript
import { UsageAccumulator, getUsageFromMessage } from '@/lib/langchain';

const accumulator = new UsageAccumulator();

// Track across multiple calls
const response1 = await chain.invoke(input1);
accumulator.add(getUsageFromMessage(response1));

const response2 = await chain.invoke(input2);
accumulator.add(getUsageFromMessage(response2));

// Log or store for billing/analytics
await logUsage(userId, accumulator.total);
```

### 3. **Handle Errors Gracefully**

```typescript
import { formatChainError } from '@/lib/langchain';

try {
  const response = await chain.invoke(input);
  return { success: true, data: response };
} catch (error) {
  const userMessage = formatChainError(error);
  return { success: false, error: userMessage };
}
```

### 4. **Use Streaming for Better UX**

```typescript
// ❌ Bad: Wait for full response
const response = await chain.invoke(input);
res.json({ response });

// ✅ Good: Stream tokens as they arrive
await streamToCallbacks(chain, input, {
  onToken: (token) => {
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
  },
  onFinal: () => {
    res.write('data: [DONE]\n\n');
    res.end();
  },
});
```

### 5. **Optimize Temperature by Use Case**

- **Structured extraction**: `temperature: 0` (deterministic)
- **Creative writing**: `temperature: 0.8-1.2` (varied)
- **General chat**: `temperature: 0.7` (balanced)
- **Code generation**: `temperature: 0-0.3` (precise)

### 6. **Validate Structured Output with Zod**

```typescript
import { z } from 'zod';

// ✅ Good: Rich validation
const FlightSchema = z.object({
  flightNumber: z.string().regex(/^[A-Z]{2}\d{1,4}$/),
  departure: z.string().length(4, 'Must be 4-letter ICAO code'),
  departureTime: z.string().datetime(),
  passengers: z.number().int().min(0).max(850),
});

// The LLM will be forced to match this schema
const extractor = makeStructuredRunnable(FlightSchema);
```

### 7. **Reuse Model Instances**

```typescript
// ❌ Bad: Create new model on every request
export async function POST(req: Request) {
  const model = createChatModel(); // Creates new instance
  // ...
}

// ✅ Good: Reuse across requests
const sharedModel = createChatModel();

export async function POST(req: Request) {
  // Use sharedModel
}
```

### 8. **Use Descriptive Zod Descriptions**

```typescript
// ❌ Bad: No context for LLM
const schema = z.object({
  total: z.number(),
});

// ✅ Good: Clear descriptions
const schema = z.object({
  total: z.number().describe('Total invoice amount in USD, including taxes'),
});
```

---

## Troubleshooting

### Issue: "Model returns incorrect JSON format"

**Solution**: Use `makeStructuredRunnable()` instead of relying on prompt instructions.

```typescript
// ❌ Unreliable
const response = await model.invoke('Return JSON with fields x, y, z');

// ✅ Reliable
const schema = z.object({ x: z.string(), y: z.number(), z: z.boolean() });
const extractor = makeStructuredRunnable(schema);
const result = await extractor.invoke(input);
```

### Issue: "Rate limit errors"

**Solution**: Add retries and exponential backoff (already built into `createChatModel`).

```typescript
const model = createChatModel({
  maxRetries: 5,
  timeout: 60000,
});
```

### Issue: "Token usage not appearing in streams"

**Solution**: Already handled! `createChatModel` includes `stream_options: { include_usage: true }`.

### Issue: "Chat history gets too long"

**Solution**: Summarize or truncate old messages.

```typescript
import { toLCMessages } from '@/lib/langchain';

const recentHistory = chatHistory.slice(-10); // Last 10 messages only
const lcMessages = toLCMessages(recentHistory);

const response = await chain.invoke({
  input: userInput,
  chat_history: lcMessages,
});
```

### Issue: "Structured output validation fails"

**Solution**: Make schemas more flexible or add `.describe()` hints.

```typescript
// ❌ Too strict
const schema = z.object({
  date: z.string().datetime(), // LLM might return "2024-01-15" not ISO
});

// ✅ More flexible
const schema = z.object({
  date: z.string().describe('Date in YYYY-MM-DD format'),
});
```

---

## Additional Resources

### Official Documentation

- [LangChain JS Docs](https://js.langchain.com/docs/)
- [LangGraph Quickstart](https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### FleetAI-Specific

- See `providers/openaidemo.ts` for working code examples
- Check `apps/web/src/app/api/` for API route implementations
- Review `apps/web/src/lib/ai/` for higher-level AI utilities

### Key Concepts to Learn

1. **Runnables**: The core abstraction in LangChain
2. **LCEL (LangChain Expression Language)**: Chain composition syntax
3. **Streaming**: Real-time token-by-token output
4. **Structured Output**: Type-safe LLM responses
5. **RAG**: Retrieval-Augmented Generation patterns

---

## Quick Reference Card

| Task            | Function                   | Example                                                 |
| --------------- | -------------------------- | ------------------------------------------------------- |
| Create model    | `createChatModel()`        | `const model = createChatModel({ temperature: 0.7 })`   |
| Simple chat     | `makeSingleTurnChain()`    | `const chain = makeSingleTurnChain()`                   |
| Chat w/ history | `makeConversationChain()`  | `chain.invoke({ input, chat_history })`                 |
| Extract data    | `makeStructuredRunnable()` | `makeStructuredRunnable(schema)`                        |
| Stream response | `streamToCallbacks()`      | `streamToCallbacks(chain, input, { onToken, onFinal })` |
| Track tokens    | `UsageAccumulator`         | `acc.add(getUsageFromMessage(msg))`                     |
| Handle errors   | `formatChainError()`       | `const msg = formatChainError(error)`                   |
| RAG search      | `makeRAGChain()`           | `makeRAGChain(retriever)`                               |
| Tool calling    | `bindTools()`              | `bindTools(llm, tools)`                                 |

---

## Contributing

When adding new utilities to this framework:

1. **Export from `index.ts`** for easy imports
2. **Add usage examples** to this README
3. **Include JSDoc comments** in your code
4. **Test with `openaidemo.ts`** patterns
5. **Follow the naming conventions**:
   - `create*`: Factory functions that return instances
   - `make*`: Builder functions that return configured objects
   - `to*`: Conversion/transformation functions
   - `format*`: Formatting utilities
   - `stream*`: Streaming-related functions

---

## License

This framework is part of the FleetAI project. See main project LICENSE.

---

**Last Updated**: October 2025  
**Maintainer**: FleetAI Development Team  
**Questions?**: See the demo file or check the main project documentation.
