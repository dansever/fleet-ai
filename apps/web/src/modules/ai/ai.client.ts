// src/modules/ai/ai.client.ts

import { LLMResult } from '@/types/llm';

/**
 * Call the AI client with a prompt using the streaming endpoint
 * @param prompt
 * @returns
 */
export async function callLLM(prompt: string): Promise<LLMResult<string>> {
  const response = await fetch('/api/ai-chat/langchain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          parts: [{ type: 'text', text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let actualUsage: { inputTokens: number; outputTokens: number; totalTokens: number } | null = null;

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
            // Extract actual token usage if provided by the server
            actualUsage = {
              inputTokens: data.usage.input_tokens || 0,
              outputTokens: data.usage.output_tokens || 0,
              totalTokens: data.usage.total_tokens || 0,
            };
          }
        } catch (e) {
          // Ignore malformed JSON
        }
      }
    }
  }

  // Use actual usage if available, otherwise fall back to estimation
  const usage = actualUsage || {
    inputTokens: Math.ceil(prompt.length / 4), // Fallback estimation
    outputTokens: Math.ceil(fullContent.length / 4), // Fallback estimation
    totalTokens: Math.ceil((prompt.length + fullContent.length) / 4), // Fallback estimation
  };

  return {
    content: fullContent,
    usage,
  };
}
