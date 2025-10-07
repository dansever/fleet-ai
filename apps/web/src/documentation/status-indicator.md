# Global Status Indicator - Quick Usage Guide

A persistent top-right overlay that shows background job status across your entire Next.js app. It stays mounted across route changes, syncs across tabs, and supports SSE or polling.

## Install

```bash
npm i zustand
# or
pnpm add zustand
# or
yarn add zustand
```

## Files you should already have

- `src/types/job.ts` - `JobStatus`, `JobState`
- `src/stores/statusStore.ts` - Zustand store with `updateGlobalStatus(...)`
- `src/hooks/useJobSSE.ts` - SSE subscription hook
- `src/hooks/useStatusPolling.ts` - Polling fallback hook
- `src/components/StatusIndicator.tsx` - UI component
- `src/app/api/status/stream/route.ts` - SSE demo route
- `src/app/api/status/get/route.ts` - Polling demo route
  ```

  ```

## Quick start

1. **Render globally so it is “above pages”**

```tsx
// src/app/layout.tsx
import './globals.css';
import { StatusIndicator } from '@/components/StatusIndicator';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <StatusIndicator /> {/* stays mounted on every route */}
      </body>
    </html>
  );
}
```

2. **Start a job and set an initial state**

```ts
// anywhere in client code
'use client';
import { updateGlobalStatus } from '@/stores/statusStore';

const jobId = 'job_123';
updateGlobalStatus('queued', 'Queued for processing', 0, jobId);
```

3. **Subscribe to backend updates**

- Use SSE when available:

  ```tsx
  'use client';
  import { useJobSSE } from '@/hooks/useJobSSE';

  export default function Page() {
    const jobId = 'job_123';
    useJobSSE(jobId);
    return <div>...</div>;
  }
  ```

- Use polling as a fallback:

  ```tsx
  'use client';
  import { useStatusPolling } from '@/hooks/useStatusPolling';

  export default function Page() {
    const jobId = 'job_123';
    useStatusPolling(jobId, 8000);
    return <div>...</div>;
  }
  ```

4. **Update status from anywhere**

```ts
updateGlobalStatus('processing', 'Crunching data...', 42, 'job_123');
updateGlobalStatus('completed', 'Analysis complete', 100, 'job_123');
// on error
updateGlobalStatus('error', 'Something went wrong while analyzing');
```

## Server integration tips

- SSE route should emit JSON lines:

  ```ts
  // server pushes events like:
  { "status":"processing", "message":"...", "progress":60, "jobId":"job_123" }
  ```

- Stop streaming when the job is completed or failed.
- Keep the route unbuffered and non-cached. The provided demo route already sets correct headers.

## Persistence and multi tab

- State persists per session using Zustand `persist` with `sessionStorage`.
- Tabs sync via `BroadcastChannel`. No extra setup required.

## Customization

- Change colors using the CSS variables shown above.
- Edit copy in `StatusIndicator.tsx` for your product language.
- Replace `sessionStorage` with `localStorage` in the store if you want longer retention.

## Good patterns

- Set a `jobId` as soon as you enqueue work, then call `updateGlobalStatus('queued', ...)`.
- Prefer SSE for real time. Fall back to polling when SSE is not possible.
- Only show `progress` when you have a real percentage. Omit it otherwise.

## Common pitfalls

- Do not mount `StatusIndicator` inside a page component. It must live in `app/layout.tsx`.
- Do not forget to call `updateGlobalStatus` before SSE emits, or the UI will stay idle.
- Do not send buffered responses from the SSE route. Ensure `text/event-stream` and no buffering.
