import type { AIMessage, AIMessageChunk } from '@langchain/core/messages';

/**
 * Usage type
 * @param input_tokens - The input tokens
 * @param output_tokens - The output tokens
 * @param total_tokens - The total tokens
 */
export type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
};

/**
 * Get usage from message
 * @param msg - The message
 * @returns The usage
 */
export function getUsageFromMessage(
  msg: AIMessage | AIMessageChunk | undefined,
): Usage | undefined {
  return (msg?.usage_metadata as any) ?? (msg?.response_metadata as any)?.tokenUsage;
}

/**
 * Simple accumulator to sum usage across multiple model calls in a request.
 * @param total - The total usage
 */
export class UsageAccumulator {
  total: Usage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

  add(u?: Usage) {
    if (!u) return;
    this.total.input_tokens = (this.total.input_tokens ?? 0) + (u.input_tokens ?? 0);
    this.total.output_tokens = (this.total.output_tokens ?? 0) + (u.output_tokens ?? 0);
    this.total.total_tokens = (this.total.total_tokens ?? 0) + (u.total_tokens ?? 0);
  }
}
