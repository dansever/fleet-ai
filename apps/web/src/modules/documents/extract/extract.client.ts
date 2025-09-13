// modules/documents/extract/extract.client.ts

import { api } from '@/services/api-client';

export async function startExtraction(formData: FormData): Promise<{ jobId: string }> {
  const res = await api.post('/api/extract/start', { body: formData });
  if (res.status !== 200) throw new Error('Failed to start extraction');
  return res.data;
}

// SSE subscribe
export function subscribeExtraction(jobId: string, onEvent: (e: MessageEvent) => void) {
  const es = new EventSource(`/api/extract/jobs/${jobId}/events`, { withCredentials: true });
  es.addEventListener('progress', onEvent);
  es.addEventListener('done', onEvent);
  es.addEventListener('error', onEvent);
  return () => es.close();
}

// Polling fallback
export async function getExtractionStatus(jobId: string) {
  const res = await api.get(`/api/extract/jobs/${jobId}/status`);
  if (res.status !== 200) throw new Error('Status fetch failed');
  return res.data as Promise<{
    status: 'queued' | 'running' | 'success' | 'failed';
    step: string;
    percent: number;
  }>;
}
