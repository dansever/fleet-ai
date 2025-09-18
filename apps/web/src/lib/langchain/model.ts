import type { ChatOpenAIFields } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export const ActiveModelConfigSchema = z.object({
  model: z.string().default('gpt-4o-mini'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().optional(),
  timeout: z.number().int().positive().optional(),
  maxRetries: z.number().int().min(0).default(3),
  // Extra OpenAI params go here if you need them:
  // frequency_penalty, presence_penalty, top_p, etc.
});

export type ActiveModelConfig = z.infer<typeof ActiveModelConfigSchema>;

export function createChatModel(cfg: Partial<ActiveModelConfig> = {}) {
  const conf = ActiveModelConfigSchema.parse(cfg);

  const fields: ChatOpenAIFields = {
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
 */
export function createResponsesModel(cfg: Partial<ActiveModelConfig> = {}) {
  const base = createChatModel({ ...cfg });
  return new ChatOpenAI({
    ...base,
    model: cfg.model ?? 'gpt-4o-mini',
    // Responses API specific options:
    useResponsesApi: true as any,
    outputVersion: 'responses/v1' as any,
    modelKwargs: {
      ...(base as any).modelKwargs,
      stream_options: { include_usage: true },
    },
  } as any);
}
