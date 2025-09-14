'use client';
import { useStatusStore } from '@/stores/statusStore';
import { useEffect } from 'react';

export function useStatusPolling(jobId?: string, intervalMs = 8000) {
  const { setState } = useStatusStore();

  useEffect(() => {
    if (!jobId) return;
    let active = true;

    const tick = async () => {
      try {
        const res = await fetch(`/api/status/get?jobId=${encodeURIComponent(jobId)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active) setState({ ...data, timestamp: new Date().toISOString() });
      } catch {}
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [jobId, intervalMs, setState]);
}
