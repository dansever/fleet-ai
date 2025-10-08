import { Contract, Document } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { DocumentCreateInput, DocumentUpdateInput } from './documents.types';

/**
 * Get a document by ID
 */
export async function getDocumentById(id: Document['id']): Promise<Document> {
  const res = await api.get(`/api/file-manager/documents/${id}`);
  return res.data;
}

/**
 * Get all documents for an organization
 */
export async function listDocumentsByContract(contractId?: Contract['id']): Promise<Document[]> {
  const res = await api.get(`/api/file-manager/documents/list/${contractId}`);
  return res.data;
}

/**
 * Create a new document
 */
export async function createDocument(data: DocumentCreateInput): Promise<Document> {
  const res = await api.post('/api/file-manager/documents/create', data);
  return res.data;
}

/**
 * Update a document
 */
export async function updateDocument(
  id: Document['id'],
  data: DocumentUpdateInput,
): Promise<Document> {
  const res = await api.put(`/api/file-manager/documents/${id}`, data);
  return res.data;
}

/**
 * Delete a document
 * @param id - The ID of the document to delete
 * @returns void
 */
export async function deleteDocument(id: Document['id']): Promise<void> {
  await api.delete(`/api/file-manager/documents/${id}`);
}
