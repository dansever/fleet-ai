export const LLAMA_BASE = 'https://api.cloud.llamaindex.ai';

export function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY!}`,
    Accept: 'application/json',
  };
}

// Add ?project_id & ?organization_id to every call
export function withCtx(path: string) {
  const p = new URL(path, LLAMA_BASE);
  p.searchParams.set('project_id', process.env.LLAMA_EXTRACT_PROJECT_ID!);
  p.searchParams.set('organization_id', process.env.LLAMA_ORGANIZATION_ID!);
  return p.toString();
}
