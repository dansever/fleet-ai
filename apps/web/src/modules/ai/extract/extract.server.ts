// Server-side document extraction functions using LlamaExtract API
// These functions can be used in API routes or server components

import { recordAiTokenUsage } from '@/services/record-usage';
import type {
  ExtractionAgent,
  ExtractionJob,
  ExtractionResult,
  UploadedFile,
} from './extract.types';

const LLAMA_BASE = 'https://api.cloud.llamaindex.ai';

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY!}`,
    Accept: 'application/json',
  };
}

function withCtx(path: string) {
  const p = new URL(path, LLAMA_BASE);
  p.searchParams.set('project_id', process.env.LLAMA_EXTRACT_PROJECT_ID!);
  p.searchParams.set('organization_id', process.env.LLAMA_ORGANIZATION_ID!);
  return p.toString();
}

/**
 * Server-side function to get extraction agent by name
 */
export async function getExtractionAgentServer(
  agentName: string = 'fleet-ai-contract-extractor',
): Promise<ExtractionAgent> {
  const response = await fetch(
    withCtx(`/api/v1/extraction/extraction-agents/by-name/${encodeURIComponent(agentName)}`),
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get extraction agent: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Server-side function to upload file for extraction
 */
export async function uploadFileForExtractionServer(
  file: Blob,
  fileName: string,
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('upload_file', file, fileName);

  const response = await fetch(withCtx('/api/v1/files'), {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Server-side function to start extraction job
 */
export async function startExtractionJobServer(
  fileId: string,
  agentId: string,
): Promise<ExtractionJob> {
  const response = await fetch(withCtx('/api/v1/extraction/jobs'), {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId, extraction_agent_id: agentId }),
  });

  if (!response.ok) {
    throw new Error(`Extraction job failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Server-side function to get extraction job status
 */
export async function getExtractionJobStatusServer(jobId: string): Promise<ExtractionJob> {
  const response = await fetch(withCtx(`/api/v1/extraction/jobs/${jobId}`), {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Server-side function to get extraction results
 */
export async function getExtractionResultServer(jobId: string): Promise<ExtractionResult> {
  const response = await fetch(withCtx(`/api/v1/extraction/jobs/${jobId}/result`), {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Result fetch failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Server-side function to record extraction usage
 */
export async function recordExtractionUsageServer(
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
