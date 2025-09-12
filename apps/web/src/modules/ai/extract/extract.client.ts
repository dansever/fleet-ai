// Client-side document extraction functions using LlamaExtract API

import { recordAiTokenUsageAsync } from '@/services/record-usage';
import type {
  ExtractionAgent,
  ExtractionJob,
  ExtractionResult,
  UploadedFile,
} from './extract.types';

/**
 * Get the extraction agent by name
 */
export async function getExtractionAgent(): Promise<ExtractionAgent> {
  const response = await fetch('/api/document-extraction/agent');
  if (!response.ok) {
    throw new Error(`Failed to get extraction agent: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Upload a file for extraction
 */
export async function uploadFileForExtraction(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/document-extraction/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Start an extraction job
 */
export async function startExtractionJob(fileId: string, agentId: string): Promise<ExtractionJob> {
  const response = await fetch('/api/document-extraction/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: fileId,
      extraction_agent_id: agentId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Extraction job failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get extraction job status
 */
export async function getExtractionJobStatus(jobId: string): Promise<ExtractionJob> {
  const response = await fetch(`/api/document-extraction/status?jobId=${jobId}`);
  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get extraction job results
 */
export async function getExtractionResult(jobId: string): Promise<ExtractionResult> {
  const response = await fetch(`/api/document-extraction/result?jobId=${jobId}`);
  if (!response.ok) {
    throw new Error(`Result fetch failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Poll for extraction job completion and return results
 */
export async function pollExtractionJob(
  jobId: string,
  maxAttempts: number = 30,
  intervalMs: number = 5000, // 5 seconds
  onProgress?: (progress: number) => void,
): Promise<ExtractionResult> {
  let attempts = 0;
  const baseProgress = 70; // Starting progress when polling begins
  const maxProgress = 85; // Don't go above 85% until completion

  while (attempts < maxAttempts) {
    const jobStatus = await getExtractionJobStatus(jobId);

    if (jobStatus.status === 'SUCCESS') {
      return await getExtractionResult(jobId);
    } else if (jobStatus.status === 'FAILED') {
      throw new Error('Extraction job failed');
    }

    // Update progress smoothly with each polling attempt
    // Progress from 70% to 85% based on attempts (assuming typical 3-5 attempts)
    const progressIncrement = (maxProgress - baseProgress) / Math.min(maxAttempts, 8); // Cap at 8 for smoother progression
    const currentProgress = Math.min(
      baseProgress + (attempts + 1) * progressIncrement,
      maxProgress,
    );

    if (onProgress) {
      onProgress(Math.floor(currentProgress));
    }

    // Job is still processing, wait and retry
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Extraction job timed out');
}

/**
 * Complete document extraction workflow
 */
export async function extractDocumentData(
  file: File,
  onProgress?: (progress: number) => void,
  userId?: string,
  orgId?: string,
): Promise<ExtractionResult> {
  try {
    // Step 1: Get the extraction agent
    if (onProgress) onProgress(10);
    const agent = await getExtractionAgent();

    // Step 2: Upload the file
    if (onProgress) onProgress(30);
    const uploadedFile = await uploadFileForExtraction(file);

    // Step 3: Start extraction job
    if (onProgress) onProgress(50);
    const job = await startExtractionJob(uploadedFile.id, agent.id);

    if (onProgress) onProgress(70);

    // Step 4: Poll for completion and get results
    const result = await pollExtractionJob(job.id, 30, 5000, onProgress);

    if (onProgress) onProgress(100);

    // Record usage if user/org info is provided
    if (userId && orgId && result.extraction_metadata?.usage) {
      const totalTokens =
        result.extraction_metadata.usage.num_document_tokens +
        result.extraction_metadata.usage.num_output_tokens;

      await recordAiTokenUsageAsync({
        userId,
        orgId,
        totalTokens,
      }).catch((error) => {
        console.error('Failed to record extraction usage:', error);
      });
    }

    return result;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown extraction error');
  }
}
