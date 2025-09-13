'use server';
import 'server-only';

import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { api } from '@/services/api-client';
import { recordAiTokenUsage } from '@/services/record-usage';
import type {
  ExtractionAgent,
  ExtractionJob,
  ExtractionResult,
  UploadedFile,
} from './extract.types';

/**
 * Server-side orchestrator for the extraction process
 * @param file - the file to extract
 * @param agentName - the name of the extraction agent
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
 * Upload a file for extraction processing
 */
export async function uploadFileForExtraction(file: File): Promise<UploadedFile> {
  // Prepare form data for LlamaCloud API
  const formData = new FormData();
  formData.append('upload_file', file, file.name ?? 'upload.bin');

  const res = await api.post(withCtx('/api/v1/files'), formData, {
    headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
  });

  if (res.status !== 200) {
    const errorText = res.data;
    throw new Error(`Failed to upload file: ${errorText}`);
  }

  return res.data;
}

/**
 * Start an extraction job for a file using an extraction agent
 */
export async function startExtractionJob(
  fileId: string,
  extractionAgentId: string,
): Promise<ExtractionJob> {
  if (!fileId || !extractionAgentId) {
    throw new Error('Both file_id and extraction_agent_id are required');
  }

  const res = await api.post(
    withCtx('/api/v1/extraction/jobs'),
    {
      file_id: fileId,
      extraction_agent_id: extractionAgentId,
    },
    {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    },
  );

  if (res.status !== 200) {
    const errorText = res.data;
    throw new Error(`Failed to start extraction job: ${errorText}`);
  }

  return res.data;
}

/**
 * Get extraction job status
 */
export async function getExtractionJobStatus(jobId: string): Promise<ExtractionJob> {
  const res = await api.get(withCtx(`/api/v1/extraction/jobs/${jobId}`), {
    headers: authHeaders(),
  });

  if (res.status !== 200) {
    const errorText = res.data;
    throw new Error(`Failed to get job status: ${errorText}`);
  }

  return res.data;
}

/**
 * Get extraction job result
 */
export async function getExtractionJobResult(jobId: string): Promise<ExtractionResult> {
  const res = await api.get(withCtx(`/api/v1/extraction/jobs/${jobId}/result`), {
    headers: authHeaders(),
  });

  if (res.status !== 200) {
    const errorText = res.data;
    throw new Error(`Failed to get job result: ${errorText}`);
  }

  return res.data;
}

/**
 * Get extraction agent by name
 */
export async function getExtractionAgent(agentName: string): Promise<ExtractionAgent> {
  const res = await api.get(
    withCtx(`/api/v1/extraction/extraction-agents/by-name/${encodeURIComponent(agentName)}`),
    {
      headers: authHeaders(),
    },
  );

  if (res.status !== 200) {
    const errorText = res.data;
    throw new Error(`Failed to get extraction agent: ${errorText}`);
  }

  return res.data;
}

/**
 * Poll for extraction job completion and return results (server-side)
 */
export async function pollExtractionJob(
  jobId: string,
  maxAttempts: number = 30,
  intervalMs: number = 5000, // 5 seconds
): Promise<ExtractionResult> {
  console.log(
    '📍 Server: Entering Poll Extraction Job for jobId:',
    jobId,
    'with maxAttempts:',
    maxAttempts,
    'and intervalMs:',
    intervalMs,
  );
  let attempts = 0;

  while (attempts < maxAttempts) {
    const jobStatus = await getExtractionJobStatus(jobId);

    if (jobStatus.status === 'SUCCESS') {
      return await getExtractionJobResult(jobId);
    } else if (jobStatus.status === 'FAILED') {
      throw new Error('Extraction job failed');
    }

    // Job is still processing, wait and retry
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Extraction job timed out');
}

/**
 * Record extraction usage for billing/analytics
 * This can be called from server components or API routes
 */
export async function recordExtractionUsage(
  result: ExtractionResult,
  userId: string,
  orgId: string,
): Promise<void> {
  if (!result.extraction_metadata?.usage) {
    console.warn('No usage metadata found in extraction result');
    return;
  }

  const totalTokens =
    result.extraction_metadata.usage.num_document_tokens +
    result.extraction_metadata.usage.num_output_tokens;

  await recordAiTokenUsage({
    userId,
    orgId,
    totalTokens,
  });
}
