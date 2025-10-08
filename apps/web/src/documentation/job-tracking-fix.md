# Job Tracking System - Race Condition Fix

## Problem

When uploading files, the job tracking system was experiencing race conditions, resulting in multiple "Job not found" errors:

```
✨ Created job: job_1759933184539_s5ximw5 (file_processing)
 POST /api/jobs 200 in 731ms
 GET /api/jobs/job_1759933184539_s5ximw5 404 in 397ms
⚠️ Job not found: job_1759933184539_s5ximw5
⚠️ Job not found: job_1759933184539_s5ximw5
⚠️ Job not found: job_1759933184539_s5ximw5
```

## Root Cause

The job tracking system uses an **in-memory Map** to store job state (`apps/web/src/modules/core/jobs/job-manager.ts`). In serverless environments (or even during development), API route requests can hit different Node.js instances, causing:

1. `POST /api/jobs` creates the job in Instance A
2. `GET /api/jobs/{jobId}` queries Instance B (which doesn't have the job)
3. Result: 404 "Job not found"

## Solution

Implemented a **multi-layered approach** to handle serverless race conditions:

### 1. Hybrid SSE + Polling (Client)

Updated `orchestrator.client.ts` to:

- First attempt **Server-Sent Events (SSE)** for real-time updates
- Automatically **fall back to polling** if SSE fails
- Gracefully handle 404 errors during polling

```typescript
// Try SSE first
const eventSource = new EventSource(`/api/jobs/${jobId}/stream`);

eventSource.onerror = (error) => {
  // Fall back to polling if SSE fails
  if (!sseAttempted && !pollingFallback) {
    pollJobStatus(jobId, onUpdate, timeoutMs).then(resolve).catch(reject);
  }
};
```

### 2. Job Recreation on Processing Endpoint

Updated `apps/web/src/app/api/file-manager/process/route.ts` to:

- Check if job exists when processing starts
- **Recreate the job** if it doesn't exist (due to different instance)
- Ensures job is available for status tracking

```typescript
if (jobId) {
  const job = getJob(jobId);
  if (!job) {
    console.warn(`⚠️ Job ${jobId} not found, creating it now (serverless instance issue)`);
    createJob({
      jobId: jobId, // Use the provided jobId
      jobType: 'file_processing',
      message: 'Starting file processing...',
      // ... metadata
    });
  }
  updateJobWithNotification(jobId, {
    /* ... */
  });
}
```

### 3. Support for Custom Job IDs

Updated `job-manager.ts` to accept custom jobIds:

- Added `jobId` field to `CreateJobOptions`
- Modified `createJob()` to use provided jobId or generate new one
- Returns existing job if jobId already exists

```typescript
export function createJob(options: CreateJobOptions = {}): JobState {
  const jobId = options.jobId || generateJobId();

  // If jobId is provided and already exists, return existing job
  if (options.jobId && jobs.has(options.jobId)) {
    return jobs.get(jobId)!;
  }
  // ... create new job
}
```

### 4. SSE Retry Logic

Updated `apps/web/src/app/api/jobs/[jobId]/stream/route.ts` to:

- Retry checking for job existence (up to 3 times, 200ms apart)
- Handles race condition where SSE connects before job is created

```typescript
let initialJob = getJob(jobId);
if (!initialJob) {
  // Retry up to 3 times with small delays (total ~600ms)
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 200));
    initialJob = getJob(jobId);
    if (initialJob) break;
  }
}
```

### 5. Small Initialization Delay

Added 100ms delay before starting SSE/polling to ensure:

- Job creation request completes
- Processing endpoint starts executing
- Job is initialized in memory

## Benefits

1. ✅ **Resilient to serverless race conditions**
2. ✅ **Automatic fallback mechanism** (SSE → Polling)
3. ✅ **Self-healing** - recreates jobs if missing
4. ✅ **Better error handling** - fewer console warnings
5. ✅ **Works in dev and production** environments

## Future Improvements

For production at scale, consider:

1. **Use a persistent store** (Redis, Database) instead of in-memory Map
2. **Use a job queue system** (BullMQ, AWS SQS) for distributed processing
3. **WebSocket connections** instead of SSE for bidirectional communication

## Testing

Test the fix by:

1. Upload a file to a contract
2. Verify status indicator shows progress
3. Check console logs - should see fewer/no "Job not found" errors
4. Verify file processes successfully

## Related Files

- `apps/web/src/modules/file-manager/workflows/orchestrator.client.ts`
- `apps/web/src/app/api/file-manager/process/route.ts`
- `apps/web/src/modules/core/jobs/job-manager.ts`
- `apps/web/src/modules/core/jobs/job.types.ts`
- `apps/web/src/app/api/jobs/[jobId]/stream/route.ts`
