// modules/extract/extract.client.ts

import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { api } from '@/services/api-client';

export async function startFileExtraction(
  file: File,
  extraction_agent_name: ExtractionAgentName,
): Promise<{ jobId: string }> {
  if (!extraction_agent_name || !file) throw new Error('Agent name and file are required');
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('extraction_agent_name', extraction_agent_name);
  // Start extraction
  const res = await api.post('/api/extract/start', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
