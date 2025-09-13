import { Contract, Document } from '@/drizzle/types';
import { client as storageClient } from '@/modules/storage';
import { api } from '@/services/api-client';
import { DocumentCreateInput, DocumentUpdateInput } from './documents.types';

/**
 * Get a document by ID
 */
export async function getDocumentById(id: Document['id']): Promise<Document> {
  const res = await api.get(`/api/documents/${id}`);
  return res.data;
}

/**
 * Get all documents for an organization
 */
export async function listDocumentsByContract(contractId?: Contract['id']): Promise<Document[]> {
  const res = await api.get(`/api/documents/list/${contractId}`);
  return res.data;
}

/**
 * Create a new document
 */
export async function createDocument(data: DocumentCreateInput): Promise<Document> {
  const res = await api.post('/api/documents/create', data);
  return res.data;
}

/**
 * Update a document
 */
export async function updateDocument(
  id: Document['id'],
  data: DocumentUpdateInput,
): Promise<Document> {
  const res = await api.put(`/api/documents/${id}`, data);
  return res.data;
}

/**
 * Delete a document
 * @param id - The ID of the document to delete
 * @param path - The path of the document to delete
 * @returns void
 */
export async function deleteDocument(
  id: Document['id'],
  path: Document['storagePath'],
): Promise<void> {
  if (!path) return;
  // delete the file from the storage
  await storageClient.deleteFile(path);
  // delete the document from the database
  await api.delete(`/api/documents/${id}`);
}
