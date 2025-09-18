// /lib/langchain/openaidemo.ts
import type { AIMessageChunk } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';

import {
  bindTools,
  createJsonModeRunnable,
  createOpenAIAgent,
  createStructuredRunnable,
  streamOpenAI,
  streamRunnable,
} from '@/lib/langchain/providers/openai';

// Optional: if you want SSE-style output, you can pipe the async iterable
// into your own SSE handler. For this short demo we just log to console.

async function demoStreamOpenAI() {
  console.log('\n--- streamOpenAI (single turn) ---');
  const it = await streamOpenAI('Write a haiku about A320 maintenance.');
  let final: AIMessageChunk | undefined;

  for await (const chunk of it) {
    const text = typeof chunk.content === 'string' ? chunk.content : '';
    if (text) process.stdout.write(text);
    final = chunk;
  }
  console.log('\nUsage:', final?.usage_metadata);
}

async function demoStreamRunnableWithPrompt() {
  console.log('\n--- streamRunnable (prompt + model chain) ---');
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
  let final: AIMessageChunk | undefined;

  for await (const chunk of it) {
    const text = typeof chunk.content === 'string' ? chunk.content : '';
    if (text) process.stdout.write(text);
    final = chunk;
  }
  console.log('\nUsage:', final?.usage_metadata);
}

async function demoStructuredOutput() {
  console.log('\n--- createStructuredRunnable (typed result) ---');
  const FlightPlan = z.object({
    tail: z.string().describe('Aircraft tail number'),
    tasks: z.array(z.string()),
    next_due_hours: z.number(),
  });

  const runnable = createStructuredRunnable(FlightPlan, { temperature: 0 });
  const result = await runnable.invoke([
    ['system', 'Return only the structured object.'],
    [
      'human',
      'For tail A6-EOZ, schedule: fluid check, tire pressure check, brake inspection. Next heavy check in 220 hours.',
    ],
  ]);

  console.log('Parsed object:', result);
}

async function demoJsonMode() {
  console.log('\n--- createJsonModeRunnable (parsed + raw) ---');
  const Schema = z.object({ ok: z.boolean(), notes: z.string() });
  const runnable = createJsonModeRunnable(Schema, { temperature: 0 });
  const { parsed, raw } = await runnable.invoke([
    ['system', 'Return strict JSON only.'],
    ['human', `{"ok": true, "notes": "ready"}`],
  ]);

  console.log('Parsed:', parsed);
  console.log('Raw usage:', (raw as AIMessageChunk).usage_metadata);
}

async function demoBindTools() {
  console.log('\n--- bindTools (tool call) ---');
  const llm = createOpenAIAgent({ temperature: 0 });

  const getFuelPrice = {
    name: 'getFuelPrice',
    description: 'Get latest fuel price at an ICAO airport code',
    schema: z.object({ icao: z.string().describe('ICAO airport code, e.g., LLBG') }),
  };

  const llmWithTools = bindTools(llm, [getFuelPrice], { tool_choice: 'auto' });
  const aiMsg = await llmWithTools.invoke("What's the current fuel price at LLBG?");
  console.log('Tool calls:', aiMsg.tool_calls);

  // Example: if the model requested the tool, you'd execute it and respond:
  // const call = aiMsg.tool_calls?.[0];
  // const toolResult = await fetchYourFuelPrice(call.args.icao);
  // const followUp = await llmWithTools.invoke([
  //   aiMsg,
  //   { tool_result: JSON.stringify(toolResult), tool_name: call.name },
  // ]);
  // console.log("Final answer:", followUp.content);
}

export async function runOpenAIDemo() {
  await demoStreamOpenAI();
  await demoStreamRunnableWithPrompt();
  await demoStructuredOutput();
  await demoJsonMode();
  await demoBindTools();
}

// If you want to run this directly with ts-node:
// runOpenAIDemo().catch(console.error);
