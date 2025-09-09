// src/modules/ai/ai.client.ts

import { api } from '@/services/api-client';
import { LlmResult } from './ai.types';

/**
 * Call the AI client with a prompt
 * @param prompt
 * @returns
 */
export async function callLLM(prompt: string): Promise<LlmResult> {
  const res = await api.post('/api/ai', { prompt });
  return res.data.output as LlmResult;
}
