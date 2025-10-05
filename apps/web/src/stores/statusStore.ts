'use client';
import type { JobState, JobStatus } from '@/types/job';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const DEFAULT_STATE: JobState = {
  status: 'idle',
  message: 'System ready',
  timestamp: new Date().toISOString(),
};

const CHANNEL_NAME = 'global-status-indicator';
let bc: BroadcastChannel | null = null;

export interface StatusStore {
  state: JobState;
  setState: (next: Partial<JobState>) => void;
  reset: () => void;
  setStatus: (status: JobStatus, message?: string, progress?: number) => void;
}

export const useStatusStore = create<StatusStore>()(
  persist(
    (set, get) => ({
      state: DEFAULT_STATE,
      setState: (next) => {
        set((s) => {
          const merged: JobState = { ...s.state, ...next, timestamp: new Date().toISOString() };
          // broadcast to other tabs
          if (typeof window !== 'undefined' && bc) bc.postMessage(merged);
          return { state: merged };
        });
      },
      setStatus: (status, message, progress) => {
        const patch: Partial<JobState> = { status };
        if (message !== undefined) patch.message = message;
        if (progress !== undefined) patch.progress = progress;
        get().setState(patch);
      },
      reset: () => set({ state: DEFAULT_STATE }),
    }),
    {
      name: 'status-indicator-v1',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // After hydration, boot BroadcastChannel listener
        if (typeof window !== 'undefined') {
          try {
            bc = new BroadcastChannel(CHANNEL_NAME);
            bc.onmessage = (ev) => {
              const next: JobState = ev.data;
              // ignore if we already have the same timestamp
              if (state?.state.timestamp !== next.timestamp) {
                state?.setState(next);
              }
            };
          } catch {
            // BroadcastChannel not supported; ignore
          }
        }
      },
    },
  ),
);

// Fire-and-forget helper to update from anywhere
export function updateGlobalStatus(
  status: JobStatus,
  message?: string,
  progress?: number,
  jobId?: string,
) {
  const { setState } = useStatusStore.getState();
  setState({ status, message, progress, jobId });
}
