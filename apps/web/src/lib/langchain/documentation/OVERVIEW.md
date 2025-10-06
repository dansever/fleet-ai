### LangChain Framework — Function Catalog (Human-Focused)

Audience: Human developers who need a clear map of what utilities exist in `lib/langchain` and when to use them. This catalog lists names and capabilities without diving into implementation details.

---

## Overview & Why

- Clean abstraction over LangChain for consistent prompts, models, streaming, and structured outputs.
- Centralizes configuration, error handling, and usage tracking.
- Enables easy provider switching while keeping a uniform developer experience.

How it works at a glance:

```
User Input
    ↓
[ Messages ] → [ Prompt Template ] → [ LLM Model ] → [ Parser ]
    ↓                                                      ↓
Chat History                                      Structured/Raw Output
```

---

## Architecture / Module Index

- `index.ts`: Central re-exports for the whole module.
- `model.ts`: Model creation and configuration.
- `prompts.ts`: FleetAI system prompt and prompt builders.
- `messages.ts`: UI ↔ LangChain message conversion.
- `chains.ts`: Pre-built runnables for common chat/RAG flows.
- `structured.ts`: Structured output helpers with Zod.
- `streaming.ts`: Token-level streaming to callbacks.
- `usage.ts`: Token usage extraction and accumulation.
- `errors.ts`: User-friendly error formatting.
- `types.ts`: Shared types.
- `providers/openai.ts`: OpenAI provider-specific creators and helpers.
- `providers/openaidemo.ts`: Demo runner showcasing provider patterns.

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

## `model.ts`

- **`ActiveModelConfigSchema`**: Zod schema defining model configuration (model, temperature, maxTokens, timeout, maxRetries).
- **`ActiveModelConfig`**: Type inferred from the schema for strong typing.
- **`createChatModel(cfg?)`**: Creates a `ChatOpenAI` instance with sensible defaults and usage-aware streaming enabled.
  - Use when you need a standard chat model for chains and prompts.
- **`createResponsesModel(cfg?)`**: Creates a `ChatOpenAI` instance configured for the Responses API and unified output format.
  - Use for advanced outputs such as tool outputs and reasoning summaries.

## `prompts.ts`

- **`FLEET_AI_SYSTEM_PROMPT`**: Canonical FleetAI persona/system prompt for aviation and fleet-management expertise.
- **`makeConversationPrompt()`**: Prompt template including system prompt, chat history placeholder, and human input.
- **`makeSingleTurnPrompt()`**: Prompt template for single-turn interactions (system + human only).

## `messages.ts`

- **`toLCMessages(messages)`**: Converts UI-style messages into LangChain message types (`HumanMessage`, `AIMessage`, `SystemMessage`). Supports `parts` arrays (text only).

## `chains.ts`

- **`makeConversationChain()`**: Runnable chain for multi-turn chat. Input: `{ input, chat_history }`. Output: `string`.
- **`makeRawConversationChain()`**: Like conversation chain but returns raw `AIMessageChunk` (includes usage/metadata). Input: `{ input, chat_history }`.
- **`makeSingleTurnChain()`**: Runnable for single-turn prompts. Input: `{ input }`. Output: `AIMessageChunk`.
- **`makeRAGChain(retriever)`**: Skeleton for Retrieval-Augmented Generation. Injects retrieved context into the prompt before calling the model.

## `structured.ts`

- **`makeStructuredRunnable(schema, cfg?)`**: Returns a runnable that enforces Zod-validated structured output. Defaults to deterministic settings.
- **`makeJsonModeRunnable(schema)`**: Returns a runnable that yields `{ parsed, raw }`, using JSON mode and including the raw `AIMessage` for usage/metadata.

## `streaming.ts`

- **`streamToCallbacks(runnable, input, opts?)`**: Streams any runnable to token-level callbacks.
  - `onToken(token)`: Called on each content chunk.
  - `onFinal(fullMessage, usage)`: Called once with the full aggregated message and usage.
  - `onError(error)`: Error callback.

## `usage.ts`

- **`type Usage`**: `{ input_tokens?, output_tokens?, total_tokens? }`.
- **`getUsageFromMessage(message)`**: Extracts usage metadata from `AIMessage` or `AIMessageChunk`.
- **`UsageAccumulator`**: Helper to accumulate usage across multiple model calls.

## `errors.ts`

- **`formatChainError(error)`**: Converts technical errors into user-friendly messages (e.g., rate limit, timeout, generic).

## `types.ts`

- **`StreamCallbacks`**: Callback shape for streaming flows.

## `providers/openai.ts`

- **`createOpenAIAgent(options?)`**: Provider-specific model creator with unified defaults and usage-aware streaming.
- **`createStructuredRunnable(schema, opts?)`**: Provider-optimized structured output helper (Zod enforced, deterministic defaults).
- **`createJsonModeRunnable(schema, opts?)`**: JSON mode variant returning `{ parsed, raw }`.
- **`bindTools(llm, tools, toolOptions?)`**: Tool/function-calling helper with `tool_choice` and `parallel_tool_calls` support.
- **`streamRunnable(runnable, input, config?)`**: Streams from any runnable (async iterable of `AIMessageChunk`).
- **`streamOpenAI(input, options?)`**: Quick single-turn streaming helper (string or messages array input).

## `providers/openaidemo.ts`

- **`runOpenAIDemo()`**: Runs a sequence of examples demonstrating streaming, prompt+model chains, structured output, JSON mode, and tool-calling.

---

## Selection Guide

- **Simple Q&A (single turn)**: `makeSingleTurnChain()` or `streamOpenAI()`.
- **Chat with history**: `makeConversationChain()` (string output) or `makeRawConversationChain()` (metadata-aware).
- **Enforce structured data**: `makeStructuredRunnable()` or provider variant.
- **Need raw message/usage**: `makeRawConversationChain()` or `makeJsonModeRunnable()`.
- **RAG pattern**: `makeRAGChain(retriever)` with your retriever implementation.
- **Token streaming UX**: `streamToCallbacks()` or provider streaming helpers.
- **Tool/function calling**: `bindTools()` with Zod-described tools.
- **Centralized error messaging**: `formatChainError()`.
- **Track/aggregate usage**: `getUsageFromMessage()`, `UsageAccumulator`.

---

## Conventions

- Naming: `create*` (factory), `make*` (builder), `to*` (conversion), `format*` (formatting), `stream*` (stream-related).
- Reuse models across requests where possible to reduce overhead.
- Prefer `temperature: 0` for structured/precise tasks; higher temperatures for creative tasks.

---

## Best Practices

- Use the right chain for the task:
  - Simple Q&A: `makeSingleTurnChain()`
  - Chat with history: `makeConversationChain()` / `makeRawConversationChain()`
  - RAG: `makeRAGChain()` with your retriever
  - Structured extraction: `makeStructuredRunnable()`
- Track token usage:
  - Extract via `getUsageFromMessage()` and aggregate with `UsageAccumulator`.
- Handle errors gracefully:
  - Wrap calls and map errors via `formatChainError()` for user-safe messages.
- Stream for UX:
  - Prefer `streamToCallbacks()` or provider streaming helpers for long answers.
- Temperature guidance:
  - Extraction/deterministic: `temperature: 0`
  - General chat: ~`0.7`
  - Creative: `0.8–1.2`
- Zod-driven structured output:
  - Add `.describe()` hints and avoid overly strict constraints when the LLM may vary.
- Reuse model instances:
  - Avoid constructing a new model per request if not necessary.

---

## Troubleshooting

- Model returns incorrect JSON format:
  - Use `makeStructuredRunnable()` instead of prompt-only instructions.
- Rate limit errors:
  - Increase `maxRetries`/`timeout` in `createChatModel()` config.
- Token usage missing in streams:
  - Enabled by default via `stream_options.include_usage`; ensure you read usage from the final chunk.
- Chat history too long:
  - Truncate or summarize older messages before passing to chains.
- Structured output validation fails:
  - Make schemas more flexible or provide `.describe()` guidance.

---

## Quick Reference

| Task            | Function                   | Example                                               |
| --------------- | -------------------------- | ----------------------------------------------------- |
| Create model    | `createChatModel()`        | `const model = createChatModel({ temperature: 0.7 })` |
| Simple chat     | `makeSingleTurnChain()`    | `const chain = makeSingleTurnChain()`                 |
| Chat w/ history | `makeConversationChain()`  | `chain.invoke({ input, chat_history })`               |
| Extract data    | `makeStructuredRunnable()` | `makeStructuredRunnable(schema)`                      |
| Stream response | `streamToCallbacks()`      | `streamToCallbacks(chain, input, { onToken })`        |
| Track tokens    | `UsageAccumulator`         | `acc.add(getUsageFromMessage(msg))`                   |
| Handle errors   | `formatChainError()`       | `formatChainError(error)`                             |
| RAG search      | `makeRAGChain()`           | `makeRAGChain(retriever)`                             |
| Tool calling    | `bindTools()`              | `bindTools(llm, tools)`                               |

---

## Contributing

1. Export new utilities from `index.ts`.
2. Add usage examples to `documentation/EXAMPLES.md`.
3. Include JSDoc comments in code.
4. Follow naming conventions (`create*`, `make*`, `to*`, `format*`, `stream*`).
5. Test provider patterns with `providers/openaidemo.ts` where applicable.

---

## Additional Resources

- LangChain JS Docs: `https://js.langchain.com/docs/`
- LangGraph Quickstart: `https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/`
- OpenAI API Reference: `https://platform.openai.com/docs/api-reference`
