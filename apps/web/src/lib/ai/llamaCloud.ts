export const LLAMA_BASE = 'https://api.cloud.llamaindex.ai';

export function authHeaders() {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;

  if (!apiKey) {
    throw new Error('LLAMA_CLOUD_API_KEY is required for LlamaCloud authentication');
  }

  // Log first few characters for debugging (but not the full key for security)
  console.log('🔑 Using LlamaCloud API key:', `${apiKey.slice(0, 4)}...`);

  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };
}

/**
 * Add ?project_id & ?organization_id to every call
 * @param path - the path to the llama cloud api
 * @returns the path with ?project_id & ?organization_id
 * @example
 * const path = withCtx('/api/v1/extraction/jobs');
 * console.log(path);
 * // https://api.cloud.llamaindex.ai/api/v1/extraction/jobs?project_id=123&organization_id=456
 */
export function withCtx(path: string) {
  const projectId = process.env.LLAMA_EXTRACT_PROJECT_ID;
  const organizationId = process.env.LLAMA_ORGANIZATION_ID;

  if (!projectId) {
    console.error('❌ LLAMA_EXTRACT_PROJECT_ID is not set in environment variables');
    throw new Error('LLAMA_EXTRACT_PROJECT_ID is required for LlamaCloud API calls');
  }

  if (!organizationId) {
    console.error('❌ LLAMA_ORGANIZATION_ID is not set in environment variables');
    throw new Error('LLAMA_ORGANIZATION_ID is required for LlamaCloud API calls');
  }

  const p = new URL(path, LLAMA_BASE);
  p.searchParams.set('project_id', projectId);
  p.searchParams.set('organization_id', organizationId);

  console.log('🌐 LlamaCloud API URL:', p.toString());
  return p.toString();
}
