'use client';
import { useStatusStore } from '@/stores/statusStore';
import { useEffect, useRef } from 'react';

/**
 * Subscribe to an SSE endpoint that emits JSON events for a given jobId.
 * The server should send events like: { status, message, progress, jobId }
 */
export function useJobSSE(jobId?: string) {
  const { setState } = useStatusStore();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) return;

    try {
      const url = `/api/status/stream?jobId=${encodeURIComponent(jobId)}`;
      const es = new EventSource(url, { withCredentials: false });
      esRef.current = es;

      es.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          setState({ ...data, timestamp: new Date().toISOString() });
        } catch {}
      };

      es.onerror = () => {
        // Network or server closed; keep the last known state, optionally mark as error
        // setState({ status: 'error', message: 'Connection lost' });
      };

      return () => {
        es.close();
        esRef.current = null;
      };
    } catch {
      // ignore
    }
  }, [jobId, setState]);
}
