import { backendApi } from '../api-client';

type ResponseEnvelope<T> = { success: boolean; message?: string; data?: T };
type LLMData = { analysis: unknown };

export async function simpleLLM(prompt: string) {
  const res = await backendApi.post<ResponseEnvelope<LLMData>>(
    '/api/v1/llm/test',
    null, // no body
    { params: { prompt } }, // query parameter
  );
  return res.data.data?.analysis;
}
