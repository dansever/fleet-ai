// /lib/langchain/model.ts

import { serverEnv } from '@/lib/env/server';
import type { ChatOpenAIFields } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

/**
 * Active model configuration schema
 * @param model - Model name
 * @param temperature - Temperature
 * @param maxTokens - Max tokens
 * @param timeout - Timeout
 * @param maxRetries - Max retries
 */
export const ActiveModelConfigSchema = z.object({
  model: z.string().default('gpt-4o-mini'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().optional(),
  timeout: z.number().int().positive().optional(),
  maxRetries: z.number().int().min(0).default(3),
  // Extra OpenAI params go here if you need them:
  // frequency_penalty, presence_penalty, top_p, etc.
});

/**
 * Active model configuration type
 * @param model - Model name
 * @param temperature - Temperature
 * @param maxTokens - Max tokens
 * @param timeout - Timeout
 * @param maxRetries - Max retries
 */
export type ActiveModelConfig = z.infer<typeof ActiveModelConfigSchema>;

/**
 * Create a chat model
 * @param cfg - Configuration
 * @returns Chat model
 */
export function createChatModel(cfg: Partial<ActiveModelConfig> = {}) {
  const conf = ActiveModelConfigSchema.parse(cfg);
  const fields: ChatOpenAIFields = {
    apiKey: serverEnv.OPENAI_API_KEY,
    model: conf.model,
    temperature: conf.temperature,
    maxTokens: conf.maxTokens,
    timeout: conf.timeout,
    maxRetries: conf.maxRetries,
    // Ensure usage is returned on streamed runs
    // (passed through to OpenAI as chat.completions stream_options)
    modelKwargs: {
      stream_options: { include_usage: true },
    },
  };

  return new ChatOpenAI(fields);
}

/**
 * Optional: Responses API + unified output format.
 * Use when you want built-in tool output, reasoning summaries, etc.
 * See: output_version "responses/v1".
 * @param cfg - Configuration
 * @returns Responses model
 */
export function createResponsesModel(cfg: Partial<ActiveModelConfig> = {}) {
  const base = createChatModel({ ...cfg });
  return new ChatOpenAI({
    ...base,
    model: cfg.model,
    // Responses API specific options:
    useResponsesApi: true as any,
    outputVersion: 'responses/v1' as any,
    modelKwargs: {
      ...(base as any).modelKwargs,
      stream_options: { include_usage: true },
    },
  } as any);
}
