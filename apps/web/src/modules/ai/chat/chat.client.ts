// Chat Client - Handles AI chat interactions with proper error handling and streaming

import { AIError, ChatCompletionRequest, LLMResult, StreamChunk, Usage } from '../types';

/**
 * Enhanced AI Chat Client with robust error handling and streaming support
 */
export class ChatClient {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number;

  constructor(baseUrl = '/api/ai-chat', timeout = 30000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  /**
   * Send a simple prompt to the AI and get a complete response
   * @param prompt - The user prompt
   * @param options - Optional configuration
   * @returns Promise resolving to LLM result
   */
  async sendPrompt(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {},
  ): Promise<LLMResult<string>> {
    const messages = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        parts: [{ type: 'text', text: options.systemPrompt }],
      });
    }

    messages.push({
      role: 'user',
      parts: [{ type: 'text', text: prompt }],
    });

    const request: ChatCompletionRequest = {
      messages,
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      stream: false,
    };

    return this.sendChatCompletion(request);
  }

  /**
   * Send a chat completion request with full control over messages
   * @param request - Chat completion request
   * @returns Promise resolving to LLM result
   */
  async sendChatCompletion(request: ChatCompletionRequest): Promise<LLMResult<string>> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/langchain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      if (request.stream) {
        return this.handleStreamingResponse(response);
      } else {
        return this.handleNonStreamingResponse(response);
      }
    } catch (error) {
      throw this.wrapError(error);
    }
  }

  /**
   * Send a streaming chat request and return an async generator
   * @param request - Chat completion request
   * @returns Async generator yielding stream chunks
   */
  async *streamChatCompletion(
    request: ChatCompletionRequest,
  ): AsyncGenerator<StreamChunk, LLMResult<string>, unknown> {
    const streamRequest = { ...request, stream: true };

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/langchain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamRequest),
      });

      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available for streaming');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let finalUsage: Usage | null = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'text-delta' && data.textDelta) {
                  fullContent += data.textDelta;
                  yield {
                    type: 'text-delta',
                    textDelta: data.textDelta,
                  };
                } else if (data.type === 'usage' && data.usage) {
                  finalUsage = {
                    inputTokens: data.usage.input_tokens || 0,
                    outputTokens: data.usage.output_tokens || 0,
                    totalTokens: data.usage.total_tokens || 0,
                  };
                  yield {
                    type: 'usage',
                    usage: finalUsage,
                  };
                } else if (data.type === 'error') {
                  yield {
                    type: 'error',
                    error: data.error || 'Unknown streaming error',
                  };
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Return final result
      const usage =
        finalUsage ||
        this.estimateUsage(request.messages?.[0]?.parts?.[0]?.text || '', fullContent);

      return {
        content: fullContent,
        usage,
        model: request.model,
      };
    } catch (error) {
      throw this.wrapError(error);
    }
  }

  /**
   * Handle streaming response for non-generator usage
   */
  private async handleStreamingResponse(response: Response): Promise<LLMResult<string>> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available for streaming');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let actualUsage: Usage | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'text-delta' && data.textDelta) {
                fullContent += data.textDelta;
              } else if (data.type === 'usage' && data.usage) {
                actualUsage = {
                  inputTokens: data.usage.input_tokens || 0,
                  outputTokens: data.usage.output_tokens || 0,
                  totalTokens: data.usage.total_tokens || 0,
                };
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const usage = actualUsage || this.estimateUsage('', fullContent);

    return {
      content: fullContent,
      usage,
    };
  }

  /**
   * Handle non-streaming response
   */
  private async handleNonStreamingResponse(response: Response): Promise<LLMResult<string>> {
    const data = await response.json();
    return {
      content: data.content || '',
      usage: data.usage || this.estimateUsage('', data.content || ''),
      model: data.model,
    };
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Handle HTTP errors with proper error types
   */
  private async handleHttpError(response: Response): Promise<AIError> {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = { message: response.statusText };
    }

    return {
      code: `HTTP_${response.status}`,
      message: errorDetails.message || `HTTP ${response.status}: ${response.statusText}`,
      details: errorDetails,
    };
  }

  /**
   * Wrap errors in consistent format
   */
  private wrapError(error: unknown): AIError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as AIError;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out',
          details: { timeout: this.defaultTimeout },
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: { originalError: error.name },
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: { error },
    };
  }

  /**
   * Estimate token usage as fallback
   */
  private estimateUsage(input: string, output: string): Usage {
    const inputTokens = Math.ceil(input.length / 4);
    const outputTokens = Math.ceil(output.length / 4);

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }
}

// Default instance for convenience
export const chatClient = new ChatClient();
