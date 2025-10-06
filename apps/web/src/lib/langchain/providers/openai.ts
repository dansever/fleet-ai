// /lib/langchain/providers/openai.ts

import { serverEnv } from '@/lib/env/server';
import type { AIMessageChunk } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';
import { ChatOpenAI, type ChatOpenAIFields } from '@langchain/openai';
import type { ZodTypeAny } from 'zod';
/**
 * Centralized OpenAI config
 * - Reads the active model from your utils
 * - Adds stream_options.include_usage so usage is emitted on streamed runs
 * - Exposes a single creator for the LLM and small helpers for common patterns
 */

type CreateOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  maxRetries?: number;
  // streamOptions?: { includeUsage?: boolean };
  streamUsage?: boolean;
};

export function createOpenAIAgent(options: CreateOptions = {}) {
  const fields: ChatOpenAIFields = {
    apiKey: serverEnv.OPENAI_API_KEY,
    model: options.model ?? serverEnv.ACTIVE_OPENAI_MODEL,
    temperature: options.temperature ?? 1,
    maxTokens: options.maxTokens ?? 1000,
    timeout: options.timeout,
    maxRetries: options.maxRetries ?? 3,
    // Ensure usage arrives on the final streamed chunk
    // modelKwargs: {
    //   stream_options: { include_usage: options.streamOptions?.includeUsage ?? true },
    streamUsage: options.streamUsage ?? true,
  };
  return new ChatOpenAI(fields);
}

/**
 * Structured output helper
 * - Uses provider-optimized structured parsing
 * - Uses low temperature (0.1) for near-deterministic results
 */
export function createStructuredRunnable<T extends ZodTypeAny>(schema: T, opts?: CreateOptions) {
  const llm = createOpenAIAgent({ temperature: 0.1, ...opts });
  return llm.withStructuredOutput(schema);
}

/**
 * JSON mode variant if you want { parsed, raw } back
 */
export function createJsonModeRunnable<T extends ZodTypeAny>(schema: T, opts?: CreateOptions) {
  const llm = createOpenAIAgent({ temperature: 0.1, ...opts });
  return llm.withStructuredOutput(schema, { method: 'jsonMode', includeRaw: true });
}

/**
 * Tool binding helper
 * - Pass Zod schemas as tools
 * - Use tool_choice and parallel_tool_calls as needed
 */
export function bindTools(
  llm = createOpenAIAgent(),
  tools: any[],
  toolOptions?: { tool_choice?: 'auto' | string; parallel_tool_calls?: boolean },
) {
  return llm.bindTools(tools, toolOptions);
}

/**
 * Stream from a Runnable or model with unified shape.
 * Returns the AsyncIterable so your SSE layer can consume it directly.
 */
export async function streamRunnable<In = any>(
  runnable: Runnable<In, AIMessageChunk>,
  input: In,
  config?: any,
): Promise<AsyncIterable<AIMessageChunk>> {
  return runnable.stream(input, config);
}

/**
 * Quick helper for single-turn prompts:
 * - You pass the prompt messages array or a string.
 * - We bind messages and stream the model directly.
 */
export async function streamOpenAI(
  input: string | Array<['system' | 'human' | 'assistant', string]>,
  options?: CreateOptions & { config?: any },
): Promise<AsyncIterable<AIMessageChunk>> {
  const llm = createOpenAIAgent(options);

  // If string, treat as single human turn
  if (typeof input === 'string') {
    return llm.stream([['human', input]], options?.config);
  }

  // If messages array, stream as-is
  return llm.stream(input, options?.config);
}
