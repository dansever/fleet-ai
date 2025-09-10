// src/lib/ai/streaming-utils.ts

/**
 * This file contains the streaming utils for the AI client.
 * It is used to handle the streaming of the AI client.
 * Functions:
 * - parseTokenUsage: Extracts & normalizes token usage from LangChain chunk metadata
 * - extractChunkContent: Extracts text content from various chunk types
 * - extractUserInput: Extracts user input from UI messages array
 * - createSSEData: Creates a Server-Sent Events formatted data string
 * - LangChainStreamHandler: Creates a streaming response handler for LangChain chains
 */

import { UIMessage } from 'ai';
import { TokenUsage } from './utils';

export interface StreamChunk {
  content?: string;
  usage_metadata?: any;
}

/**
 * Extracts and normalizes token usage from LangChain chunk metadata
 */
export function parseTokenUsage(chunk: any): TokenUsage | null {
  const usageData = chunk?.usage_metadata;
  if (!usageData) return null;

  const inputTokens = usageData.input_tokens ?? usageData.inputTokens ?? 0;
  const outputTokens = usageData.output_tokens ?? usageData.outputTokens ?? 0;
  const totalTokens = usageData.total_tokens ?? usageData.totalTokens ?? inputTokens + outputTokens;

  if (totalTokens <= 0) return null;

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
  };
}

/**
 * Extracts text content from various chunk types
 */
export function extractChunkContent(chunk: any): string | null {
  // Handle string chunks
  if (typeof chunk === 'string') {
    return chunk;
  }

  // Handle AIMessageChunk objects
  const content = chunk?.content;
  if (typeof content === 'string' && content.length > 0) {
    return content;
  }

  return null;
}

/**
 * Extracts user input from UI messages array
 */
export function extractUserInput(messages: UIMessage[]): string {
  const latestMessage = messages[messages.length - 1];
  return (
    latestMessage.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('') || ''
  );
}

/**
 * Creates a Server-Sent Events formatted data string
 */
export function createSSEData(type: string, data: any): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

/**
 * Creates a streaming response handler for LangChain chains
 */
export class LangChainStreamHandler {
  private encoder = new TextEncoder();
  private tokenUsage: TokenUsage | null = null;

  constructor(
    private onUsageDetected?: (usage: TokenUsage) => void,
    private onError?: (error: any) => void,
  ) {}

  createReadableStream(stream: AsyncIterable<any>): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start: async (controller) => {
        try {
          await this.processStream(stream, controller);
          this.finishStream(controller);
        } catch (error) {
          console.error('Streaming error:', error);
          this.onError?.(error);
          controller.error(error);
        }
      },
    });
  }

  private async processStream(
    stream: AsyncIterable<any>,
    controller: ReadableStreamDefaultController<Uint8Array>,
  ): Promise<void> {
    for await (const chunk of stream) {
      // Parse token usage
      const usage = parseTokenUsage(chunk);
      if (usage) {
        this.tokenUsage = usage;
        this.onUsageDetected?.(usage);
      }

      // Extract and send content
      const content = extractChunkContent(chunk);
      if (content) {
        const data = createSSEData('text-delta', { textDelta: content });
        controller.enqueue(this.encoder.encode(data));
      }
    }
  }

  private finishStream(controller: ReadableStreamDefaultController<Uint8Array>): void {
    // Send final message
    const finalData = createSSEData('finish', { finishReason: 'stop' });
    controller.enqueue(this.encoder.encode(finalData));
    controller.close();
  }

  getTokenUsage(): TokenUsage | null {
    return this.tokenUsage;
  }
}
