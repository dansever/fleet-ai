'use server';
import 'server-only';

// Server-side extraction utilities
// Utility functions for server-side extraction operations

import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { api } from '@/services/api-client';
import { recordAiTokenUsage } from '@/services/record-usage';
import type { ExtractionResult } from './extract.types';

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

/**
 * Upload a file for extraction processing
 */
export async function uploadFileForExtraction(file: File) {
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
export async function startExtractionJob(fileId: string, extractionAgentId: string) {
  if (!fileId || !extractionAgentId) {
    throw new Error('Both file_id and extraction_agent_id are required');
  }

  const res = await api.post(withCtx('/api/v1/extraction/jobs'), {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    data: {
      file_id: fileId,
      extraction_agent_id: extractionAgentId,
    },
  });

  if (res.status !== 200) {
    const errorText = res.data;
    throw new Error(`Failed to start extraction job: ${errorText}`);
  }

  return res.data;
}

/**
 * Get extraction job status
 */
export async function getExtractionJobStatus(jobId: string) {
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
export async function getExtractionJobResult(jobId: string) {
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
export async function getExtractionAgent(agentName: string) {
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
