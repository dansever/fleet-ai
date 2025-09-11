import { Contract, Document } from '@/drizzle/types';
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
  const url = contractId ? `/api/documents?contractId=${contractId}` : '/api/documents';
  const res = await api.get(url);
  return res.data;
}

/**
 * Create a new document
 */
export async function createDocument(data: DocumentCreateInput): Promise<Document> {
  const res = await api.post('/api/documents', data);
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
