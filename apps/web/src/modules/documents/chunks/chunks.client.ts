import { Document } from '@/drizzle/types';

export type CreateChunksResponse =
  | { ok: true; inserted: number; documentId: string }
  | { ok: false; error: string };

/**
 * Request to create chunks for a document
 * @param documentId
 * @returns
 */
export async function requestCreateDocumentChunks(
  documentId: Document['id'],
): Promise<CreateChunksResponse> {
  const res = await fetch(`/api/documents/${documentId}/chunks`, {
    method: 'POST',
  });
  let data: CreateChunksResponse;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: 'Invalid server response' };
  }
  if (!res.ok || !data.ok) {
    return { ok: false, error: ('error' in data && data.error) || `HTTP ${res.status}` };
  }
  return data;
}
