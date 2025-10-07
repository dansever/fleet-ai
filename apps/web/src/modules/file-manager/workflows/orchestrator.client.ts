'use client';

import { resetGlobalStatus, updateGlobalStatus } from '@/stores/statusStore';
import type { JobStatus } from '@/types/job';
import { DocumentProcessorTypes } from './orchestrator.types';

/**
 * Poll job status until completion or timeout
 */
async function pollJob(
  jobId: string,
  onUpdate: (data: {
    status: JobStatus;
    message?: string;
    progress?: number;
    documentId?: string;
  }) => void,
  timeoutMs = 5 * 60 * 1000,
  intervalMs = 1200,
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`/api/jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch job status');
    const data = await res.json();

    onUpdate(data);

    if (data.status === 'completed' || data.status === 'error') {
      return data;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Timed out waiting for job to finish');
}

/**
 * Complete document processing orchestrator
 *
 * Handles the full workflow:
 * 1. Create job (optional - for progress tracking)
 * 2. Update status indicator
 * 3. Call file-manager API to process file
 * 4. Poll job for progress updates
 * 5. Update status indicator during processing
 * 6. Handle completion/errors
 *
 * @param file - File to process
 * @param options - Processing options including parentId, documentType, and optional progress tracking
 * @returns Processing result with documentId and extracted data
 */
export async function processDocument(
  file: File,
  options: DocumentProcessorTypes.DocumentProcessingOptions,
): Promise<DocumentProcessorTypes.DocumentProcessingResult> {
  const { parentId, parentType, trackProgress = true, onProgress } = options;

  let jobId: string | undefined;

  try {
    // Reset any stuck status first
    resetGlobalStatus();

    // Step 1: Create job for tracking (if enabled)
    if (trackProgress) {
      updateGlobalStatus('processing', 'Preparing upload...', 5);

      const createJobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobType: 'file_processing',
          message: 'Upload queued',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            documentType: parentType,
            parentId,
          },
        }),
      });

      if (!createJobRes.ok) {
        throw new Error('Failed to create tracking job');
      }

      const jobData = await createJobRes.json();
      jobId = jobData.jobId;
    } else {
      // Direct processing without tracking
      updateGlobalStatus('processing', 'Processing file...', 10);
    }

    // Step 2: Build FormData for file processing
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', parentType);
    formData.append('parentId', parentId);
    if (jobId) {
      formData.append('jobId', jobId);
    }

    // Step 3: Start processing (without awaiting - polling will track it)
    const processPromise = fetch('/api/file-manager/process', {
      method: 'POST',
      body: formData,
    });

    // Step 4: If tracking enabled, poll for updates
    if (trackProgress && jobId) {
      const result = await pollJob(jobId, (data) => {
        if (data.status === 'processing') {
          const progress = data.progress || 50;
          const message = data.message || 'Processing...';
          updateGlobalStatus('processing', message, progress);
          onProgress?.(progress, message);
        } else if (data.status === 'completed') {
          updateGlobalStatus('completed', 'Document processed successfully', 100);
          onProgress?.(100, 'Completed');
        } else if (data.status === 'error') {
          updateGlobalStatus('error', data.message || 'Processing failed');
        }
      });

      // Step 5: Also get the processing result
      const processRes = await processPromise;
      const processData = await processRes.json();

      // Auto-reset status after 3 seconds
      setTimeout(() => {
        resetGlobalStatus();
      }, 3000);

      // Return combined result
      return {
        success: result.status === 'completed',
        documentId: result.documentId || processData.documentId,
        ...processData,
      };
    } else {
      // Direct result without polling
      const processRes = await processPromise;
      const processData = await processRes.json();

      if (processData.success) {
        updateGlobalStatus('completed', 'Document processed successfully', 100);
        onProgress?.(100, 'Completed');

        // Auto-reset status after 3 seconds
        setTimeout(() => {
          resetGlobalStatus();
        }, 3000);
      } else {
        throw new Error(processData.error || 'Processing failed');
      }

      return processData;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to process file';
    updateGlobalStatus('error', msg);
    console.error('Document processing error:', error);

    // Auto-reset error status after 5 seconds
    setTimeout(() => {
      resetGlobalStatus();
    }, 5000);

    return {
      success: false,
      error: msg,
    };
  }
}
