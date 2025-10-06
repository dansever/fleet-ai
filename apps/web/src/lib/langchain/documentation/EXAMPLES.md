### LangChain Framework — Implementation Examples (AI + Human Reference)

Audience: Developers and AI coding assistants that need concrete, ready-to-adapt examples. Mirrors the patterns shown in `README.md`, organized for quick copy/paste.

---

## 1) Simple Chat (String Output)

```ts
import { makeConversationChain, toLCMessages } from '@/lib/langchain';

const chain = makeConversationChain();

const history = toLCMessages([
  { role: 'user', content: 'What is ETOPS?' },
  { role: 'assistant', content: 'ETOPS stands for Extended-range Twin-engine Operations...' },
]);

const response = await chain.invoke({
  input: 'Why is it important?',
  chat_history: history,
});

console.log(response);
```

---

## 1b) Manage Chat History (Truncate/Summarize)

```ts
import { makeConversationChain, toLCMessages } from '@/lib/langchain';

const chain = makeConversationChain();

// Keep only the last N messages to control token growth
const recent = uiChatHistory.slice(-10);
const history = toLCMessages(recent);

const answer = await chain.invoke({
  input: userInput,
  chat_history: history,
});
```

---

## 2) Streaming Tokens with Usage Tracking

```ts
import {
  makeRawConversationChain,
  streamToCallbacks,
  UsageAccumulator,
  getUsageFromMessage,
  formatChainError,
} from '@/lib/langchain';

const chain = makeRawConversationChain();
const usage = new UsageAccumulator();

await streamToCallbacks(
  chain,
  { input: 'Explain fuel tankering', chat_history: [] },
  {
    onToken: (token) => {
      // e.g. forward to SSE
      process.stdout.write(token);
    },
    onFinal: (full, u) => {
      usage.add(u);
      console.log('\nTotal usage:', usage.total);
    },
    onError: (err) => {
      console.error('Stream error:', formatChainError(err));
    },
  },
);
```

---

## 3) Single-Turn Q&A

```ts
import { makeSingleTurnChain } from '@/lib/langchain';

const chain = makeSingleTurnChain();
const answer = await chain.invoke({ input: 'Define MEL in aviation' });
console.log(answer.content);
```

---

## 4) RAG Skeleton (Inject Retrieved Context)

```ts
import { makeRAGChain } from '@/lib/langchain';

const retriever = {
  getRelevantDocuments: async (query: string) => {
    // Implement your vector search here
    return [{ pageContent: 'Policy: Maintenance must be recorded per flight...' }];
  },
};

const rag = makeRAGChain(retriever);
const out = await rag.invoke({ input: 'What are our maintenance policies?' });
console.log(out.content);
```

---

## 5) Structured Output with Zod

```ts
import { makeStructuredRunnable } from '@/lib/langchain';
import { z } from 'zod';

const Invoice = z.object({
  invoiceNumber: z.string(),
  date: z.string(),
  vendor: z.string(),
  total: z.number(),
});

const extractor = makeStructuredRunnable(Invoice, { model: 'gpt-4o', temperature: 0 });

const parsed = await extractor.invoke([
  ['system', 'Extract invoice. Return only the structured object.'],
  ['human', 'Invoice #1337 on 2024-01-15 from ACME Total: 1299.50 USD'],
]);

console.log(parsed.invoiceNumber);
```

---

## 6) JSON Mode: Parsed + Raw Message

```ts
import { makeJsonModeRunnable } from '@/lib/langchain';
import { z } from 'zod';

const Flight = z.object({ flightNumber: z.string(), notes: z.string() });
const runnable = makeJsonModeRunnable(Flight);

const { parsed, raw } = await runnable.invoke([
  ['system', 'Return strict JSON only.'],
  ['human', 'Give flightNumber AA123 and notes "ready"'],
]);

console.log(parsed);
console.log('usage:', raw.usage_metadata);
```

---

## 7) Provider Helpers (OpenAI)

```ts
import {
  createOpenAIAgent,
  createStructuredRunnable,
  createJsonModeRunnable,
  bindTools,
  streamRunnable,
  streamOpenAI,
} from '@/lib/langchain/providers/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';

// Quick single-turn streaming
const stream = await streamOpenAI('What is ICAO?', { model: 'gpt-4o-mini' });
for await (const chunk of stream) {
  process.stdout.write(typeof chunk.content === 'string' ? chunk.content : '');
}

// Prompt + model chain streaming
const model = createOpenAIAgent({ temperature: 0.7 });
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are FleetAI. Be concise.'],
  ['human', '{input}'],
]);
const chain = RunnableSequence.from([
  (x: { input: string }) => ({ input: x.input }),
  prompt,
  model,
]);
const it = await streamRunnable(chain, { input: 'List 3 preflight checks.' });
for await (const c of it) process.stdout.write(typeof c.content === 'string' ? c.content : '');

// Structured output (provider-optimized)
const FlightPlan = z.object({ tail: z.string(), tasks: z.array(z.string()) });
const structured = createStructuredRunnable(FlightPlan, { temperature: 0 });
const fp = await structured.invoke([
  ['system', 'Return only the structured object.'],
  ['human', 'Tail N12345: do tire pressure, brake inspection'],
]);

// Tool calling
const llm = createOpenAIAgent({ temperature: 0 });
const getFuelPrice = {
  name: 'getFuelPrice',
  description: 'Get latest fuel price at an ICAO airport code',
  schema: z.object({ icao: z.string().describe('ICAO airport code') }),
};
const llmWithTools = bindTools(llm, [getFuelPrice], { tool_choice: 'auto' });
const aiMsg = await llmWithTools.invoke('Fuel price at LLBG?');
console.log(aiMsg.tool_calls);
```

---

## 8) Error Handling & Usage

```ts
import { formatChainError, getUsageFromMessage, UsageAccumulator } from '@/lib/langchain';

try {
  const res = await someRunnable.invoke({ input: 'Hello' });
  const usage = getUsageFromMessage(res);
  const acc = new UsageAccumulator();
  acc.add(usage);
  console.log('usage:', acc.total);
} catch (e) {
  console.error(formatChainError(e));
}
```

---

## 9) Best-Practice Snippets

- Reuse shared model instances for performance when appropriate.
- Use `temperature: 0` for extraction and deterministic tasks.
- Stream outputs for better UX in long responses.
- Describe Zod fields to guide the model during structured extraction.
