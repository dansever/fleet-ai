import { backendApi } from '../api-client';

export async function simpleLLM(prompt: string) {
  const res = await backendApi.post('/api/v1/llm/test', { prompt });
  return res;
}
