'use client';
import type { JobState, JobStatus } from '@/types/job';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * This store is used to store the status of the application.
 */
const DEFAULT_STATE: JobState = {
  status: 'idle',
  message: 'System ready',
  timestamp: new Date().toISOString(),
};

// The name of the channel to broadcast the status to
const CHANNEL_NAME = 'global-status-indicator';
// Cross-tab synchronization via BroadcastChannel
let bc: BroadcastChannel | null = null;

/**
 * The interface for the status store.
 */
export interface StatusStore {
  state: JobState;
  setState: (next: Partial<JobState>) => void;
  reset: () => void;
  setStatus: (status: JobStatus, message?: string, progress?: number) => void;
}

/**
 * Initialize the BroadcastChannel listener
 * Avoids duplicate listeners
 * @param stateSetter
 * @returns
 */
function initBroadcastChannel(stateSetter: (next: JobState) => void) {
  if (typeof window === 'undefined' || bc) return;
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (ev) => {
      const next: JobState = ev.data;
      stateSetter(next);
    };
  } catch {
    // Ignore lack of BroadcastChannel support (not supported in all browsers)
  }
}

let isInitialized = false;

/**
 * The useStatusStore hook.
 */
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
        if (progress !== undefined) patch.progress = Math.min(100, Math.max(0, progress));
        get().setState(patch);
      },
      reset: () => set({ state: { ...DEFAULT_STATE, timestamp: new Date().toISOString() } }),
    }),
    {
      name: 'status-indicator-v1', // Name of the store
      storage: createJSONStorage(() => sessionStorage), // Session-scoped persistence
      version: 1, // Version of the store
      // On rehydration, boot BroadcastChannel listener
      onRehydrateStorage: () => (state) => {
        // guard to make sure we only run once
        if (isInitialized) return;
        isInitialized = true;

        if (state)
          initBroadcastChannel((next) => {
            if (state.state.timestamp !== next.timestamp) {
              state.setState(next);
            }
          });
      },
    },
  ),
);

/**
 * Fire-and-forget helper to update from anywhere
 */
export function updateGlobalStatus(status: JobStatus, message?: string, progress?: number) {
  useStatusStore.getState().setStatus(status, message, progress);
}

/**
 * Reset status to idle - useful for clearing stuck states
 */
export function resetGlobalStatus() {
  useStatusStore.getState().reset();
}

/**
 * Auto-reset stuck processing states on page load
 */
if (typeof window !== 'undefined') {
  // Check if we have a stuck processing state on page load
  const currentState = useStatusStore.getState().state;
  if (currentState.status === 'processing' || currentState.status === 'queued') {
    // If the timestamp is older than 5 minutes, reset to idle
    const stateAge = Date.now() - new Date(currentState.timestamp).getTime();
    if (stateAge > 5 * 60 * 1000) {
      // 5 minutes
      console.log('🔄 Auto-resetting stuck status state');
      resetGlobalStatus();
    }
  }
}
