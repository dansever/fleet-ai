import { Document } from '@/drizzle/types';
import { api } from '@/services/api-client';

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
  const res = await api.post(`/api/chunks/${documentId}`, {});
  return res.data;
}
