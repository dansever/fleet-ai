import { api } from '@/services/api-client';
import { ResponseEnvelope } from '@/types/backend-response';
import { LLMResponse } from '@/types/llm';

export async function simpleLLM(prompt: string): Promise<ResponseEnvelope<LLMResponse<string>>> {
  const res = await api.post<ResponseEnvelope<LLMResponse<string>>>('/api/v1/llm/basic', {
    prompt,
  });
  return res.data;
}
