// modules/extract/extract.client.ts

// SSE subscribe
export function subscribeExtraction(jobId: string, onEvent: (e: MessageEvent) => void) {
  const es = new EventSource(`/api/extract/jobs/${jobId}/events`, { withCredentials: true });
  es.addEventListener('progress', onEvent);
  es.addEventListener('done', onEvent);
  es.addEventListener('error', onEvent);
  return () => es.close();
}
