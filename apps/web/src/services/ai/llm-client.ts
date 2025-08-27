import { ResponseEnvelope } from '@/types/backend-response';
import { LLMResponse } from '../../types/llm';
import { backendApi } from '../api-client';

export async function simpleLLM(prompt: string): Promise<ResponseEnvelope<LLMResponse<string>>> {
  const res = await backendApi.post<ResponseEnvelope<LLMResponse<string>>>('/api/v1/llm/basic', {
    prompt,
  });
  return res.data;
}

export async function simpleLLM2(prompt: string): Promise<any> {
  const res = await backendApi.post<any>('/api/v1/llm/basic', {
    prompt,
  });
  return res;
}
