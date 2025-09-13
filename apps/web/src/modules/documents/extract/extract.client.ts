// Client-side document extraction functions using LlamaExtract API

import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { api } from '@/services/api-client';
import type {
  ExtractionAgent,
  ExtractionJob,
  ExtractionResult,
  UploadedFile,
} from './extract.types';

/**
 * Orchestrate the extraction process
 * @param file - the file to extract
 * @param name - the name of the extraction agent
 * @returns the extraction result
 */
export async function fileExtractorOrchestrator(
  file: File,
  agentName: ExtractionAgentName,
): Promise<ExtractionResult> {
  try {
    console.log(
      '📍 Starting file Extractor Orchestrator for:',
      file.name,
      'with agent:',
      agentName,
    );
    // Step 1: Get the extraction agent
    const agent = await getExtractionAgent(agentName);
    // Step 2: Upload the file
    const uploadedFile = await uploadFileForExtraction(file);
    // Step 3: Start extraction job
    const job = await startExtractionJob(uploadedFile.id, agent.id);
    // Step 4: Poll for completion and get results
    const result = await pollExtractionJob(job.id, 30, 5000);
    return result;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown extraction error');
  }
}

/**
 * Get the extraction agent by name
 * @returns the extraction agent
 */
export async function getExtractionAgent(agentName: ExtractionAgentName): Promise<ExtractionAgent> {
  console.log('📍 Entering Get Extraction Agent for:', agentName);
  const response = await api.get(`/api/extract/agent/${agentName}`);
  if (response.status !== 200) {
    throw new Error(`Failed to get extraction agent: ${response.status}`);
  }
  return response.data;
}

/**
 * Upload a file for extraction
 */
export async function uploadFileForExtraction(file: File): Promise<UploadedFile> {
  console.log('📍 Entering Upload File for Extraction for:', file.name);
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/extract/upload', {
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
  console.log('📍 Entering Start Extraction Job for fileId:', fileId, 'and agentId:', agentId);
  const response = await fetch('/api/extract/extract', {
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
  console.log('📍 Entering Get Extraction Job Status for jobId:', jobId);
  const response = await fetch(`/api/extract/status/${jobId}`);
  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get extraction job results
 */
export async function getExtractionResult(jobId: string): Promise<ExtractionResult> {
  console.log('📍 Entering Get Extraction Result for jobId:', jobId);
  const response = await fetch(`/api/extract/result/${jobId}`);
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
  console.log(
    '📍 Entering Poll Extraction Job for jobId:',
    jobId,
    'with maxAttempts:',
    maxAttempts,
    'and intervalMs:',
    intervalMs,
  );
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
