import type { AIMessage } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';
import { z, ZodTypeAny } from 'zod';
import { createChatModel } from './model';

/**
 * Use OpenAI structured output via LangChain's unified helper.
 * - Accepts a Zod schema to strictly parse/validate.
 * @param schema - The Zod schema
 * @param cfg - The configuration
 * @returns The structured runnable
 */
export function makeStructuredRunnable<T extends ZodTypeAny>(
  schema: T,
  cfg?: { model?: string; temperature?: number },
): Runnable<any, z.infer<T>> {
  const llm = createChatModel({
    model: cfg?.model,
    temperature: cfg?.temperature ?? 0,
  });

  // Default mode returns the parsed object directly.
  return llm.withStructuredOutput(schema);
}

/**
 * JSON mode variant: returns raw message or { parsed, raw } depending on options.
 * See docs if you prefer to force JSON object outputs.
 * @param schema - The Zod schema
 * @returns The JSON mode runnable
 */
export function makeJsonModeRunnable<T extends ZodTypeAny>(
  schema: T,
): Runnable<any, { parsed: z.infer<T>; raw: AIMessage }> {
  const llm = createChatModel({ temperature: 0 });
  return llm.withStructuredOutput(schema, { method: 'jsonMode', includeRaw: true });
}
