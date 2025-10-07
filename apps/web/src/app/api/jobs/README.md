# Jobs API

**Purpose:** Generic job tracking system for monitoring async operations across the FleetAI application.

---

## Overview

The Jobs API provides a unified way to track and monitor long-running asynchronous operations in the system. Jobs can represent any async task including:

- File processing and document extraction
- Document analysis and insights generation
- LLM agent operations
- Background data processing
- Batch operations

Jobs are **tracking entities only** - they don't perform the work themselves. Instead, they provide a way to monitor progress and communicate status to the UI (via the status indicator).

---

## Architecture

```
User Action
  ↓
1. Create Job (/api/jobs POST) → Returns jobId
  ↓
2. Start Async Operation (worker/processor)
  ↓
3. Worker updates job during processing
  ↓
4. Client polls job status (/api/jobs/[jobId] GET)
  ↓
5. Status indicator updates in real-time
  ↓
6. Job completes/fails
```

---

## API Endpoints

### `POST /api/jobs`

Create a new job for tracking an async operation.

**Request:**

```typescript
{
  jobType?: JobType;      // Type of job (optional, defaults to 'generic')
  message?: string;       // Initial message (optional)
  metadata?: Record<string, any>;  // Additional context (optional)
}
```

**Job Types:**

- `'file_processing'` - File upload and document extraction
- `'document_analysis'` - Document analysis and insights
- `'llm_agent'` - LLM agent operations
- `'generic'` - Default for other operations

**Response:**

```typescript
{
  jobId: string; // Unique job identifier
  status: JobStatus; // Current status ('queued')
  timestamp: string; // ISO timestamp
}
```

**Example:**

```typescript
const response = await fetch('/api/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobType: 'file_processing',
    message: 'Upload queued',
    metadata: {
      fileName: 'contract.pdf',
      fileSize: 1024000,
    },
  }),
});

const { jobId } = await response.json();
```

---

### `GET /api/jobs/[jobId]`

Get current job status (for polling).

**Response:**

```typescript
{
  status: JobStatus;      // 'queued' | 'processing' | 'completed' | 'error'
  message: string;        // Current status message
  progress?: number;      // Progress percentage (0-100)
  documentId?: string;    // Set when file processing completes
  timestamp: string;      // Last update timestamp
}
```

**Example:**

```typescript
const response = await fetch(`/api/jobs/${jobId}`);
const jobState = await response.json();

console.log(`Status: ${jobState.status} - ${jobState.message}`);
console.log(`Progress: ${jobState.progress}%`);
```

---

## Job Lifecycle

### 1. Created (Queued)

Job is created and waiting to start.

```typescript
{
  status: 'queued',
  message: 'Upload queued',
  progress: 0
}
```

### 2. Processing

Job is actively being processed.

```typescript
{
  status: 'processing',
  message: 'Extracting document data...',
  progress: 45
}
```

### 3. Completed

Job finished successfully.

```typescript
{
  status: 'completed',
  message: 'Document processed successfully',
  progress: 100,
  documentId: 'doc_123abc'
}
```

### 4. Error

Job failed with an error.

```typescript
{
  status: 'error',
  message: 'Processing failed',
  error: 'Invalid file format'
}
```

---

## Integration with File Processing

The file-manager module integrates with jobs through the workflow orchestrator. Here's how they work together:

```typescript
import { workflows } from '@/modules/file-manager';

// Workflow handles job creation internally
const result = await workflows.client.processDocument(file, {
  parentId: contractId,
  parentType: 'contract',
  trackProgress: true, // Enables job tracking
});
```

**Behind the scenes:**

1. Workflow creates a job via `/api/jobs`
2. Workflow calls `/api/file-manager/process` with jobId
3. File processor updates job during processing
4. Workflow polls job and updates UI
5. Status indicator shows real-time progress

---

## Server-Side Job Management

For backend operations that need to update jobs:

```typescript
import { createJob, updateJobWithNotification, completeJob, failJob } from '@/modules/core/jobs';

// Create a job
const job = createJob({
  jobType: 'document_analysis',
  message: 'Starting analysis...',
  metadata: { documentId: 'doc_123' },
});

// Update progress
updateJobWithNotification(job.jobId, {
  status: 'processing',
  progress: 50,
  message: 'Analyzing document structure...',
});

// Complete successfully
completeJob(job.jobId, 'doc_123', 'Analysis completed');

// Or mark as failed
failJob(job.jobId, 'Failed to parse document');
```

---

## Automatic Cleanup

Jobs are automatically cleaned up after 5 minutes of reaching a terminal state (`completed` or `error`). This prevents memory leaks while keeping recent job history available.

---

## Best Practices

### 1. Always Create Jobs for User-Facing Operations

```typescript
// ✅ Good - User can track upload progress
const job = createJob({ jobType: 'file_processing' });
// ... perform upload ...

// ❌ Bad - User has no visibility into progress
// ... perform upload silently ...
```

### 2. Update Progress Regularly

```typescript
// ✅ Good - Meaningful progress updates
updateJobWithNotification(jobId, {
  progress: 25,
  message: 'Uploading file to storage...',
});
updateJobWithNotification(jobId, {
  progress: 50,
  message: 'Extracting document data...',
});

// ❌ Bad - Generic progress without context
updateJobWithNotification(jobId, { progress: 50 });
```

### 3. Include Meaningful Metadata

```typescript
// ✅ Good - Metadata helps with debugging and tracking
createJob({
  jobType: 'file_processing',
  metadata: {
    fileName: file.name,
    fileSize: file.size,
    documentType: 'contract',
    userId: user.id,
  },
});

// ❌ Bad - Missing context
createJob({ jobType: 'file_processing' });
```

### 4. Handle Errors Gracefully

```typescript
try {
  // ... processing ...
  completeJob(jobId, documentId);
} catch (error) {
  failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
}
```

---

## Migration from Old API

### Before (Coupled Implementation)

```typescript
// Old: /api/jobs handled file processing directly
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'contract');
formData.append('parentId', contractId);

const response = await fetch('/api/jobs', {
  method: 'POST',
  body: formData, // FormData
});

const { jobId } = await response.json();
// ... manual polling ...
```

### After (Decoupled Implementation)

```typescript
// New: Use workflow orchestrator
import { workflows } from '@/modules/file-manager';

const result = await workflows.client.processDocument(file, {
  parentId: contractId,
  parentType: 'contract',
  trackProgress: true,
});
// Workflow handles job creation, polling, and status updates
```

---

## Related Documentation

- [File Manager Module](../../../modules/file-manager/README.md)
- [Job Types Reference](../../../modules/core/jobs/job.types.ts)
- [Status Store](../../../stores/statusStore.ts)

---

## Support

For questions about the Jobs API:

1. Check this documentation
2. Review the file-manager workflow examples
3. Contact the development team
