export const LLAMA_BASE = 'https://api.cloud.llamaindex.ai';

export function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY!}`,
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
  const p = new URL(path, LLAMA_BASE);
  p.searchParams.set('project_id', process.env.LLAMA_EXTRACT_PROJECT_ID!);
  p.searchParams.set('organization_id', process.env.LLAMA_ORGANIZATION_ID!);
  return p.toString();
}
