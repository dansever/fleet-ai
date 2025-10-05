'use server';
import 'server-only';

import { db } from '@/drizzle';
import { documentsTable } from '@/drizzle/schema/schema.documents';
import { Contract, Document, NewDocument } from '@/drizzle/types';
import { storage } from '@/modules/files';
import { and, eq } from 'drizzle-orm';
import { DocumentUpdateInput } from './documents.types';

const storageServer = storage.server;
/**
 * Get a document by ID
 */
export async function getDocumentById(id: Document['id']): Promise<Document> {
  const document = await db.select().from(documentsTable).where(eq(documentsTable.id, id)).limit(1);

  if (!document[0]) {
    throw new Error('Document not found');
  }

  return document[0];
}

/**
 * Get all documents for a contract
 */
export async function listDocumentsByContract(contractId: Contract['id']): Promise<Document[]> {
  const documents = await db
    .select()
    .from(documentsTable)
    .where(and(eq(documentsTable.parentId, contractId), eq(documentsTable.parentType, 'contract')));
  return documents;
}

/**
 * Create a new document
 */
export async function createDocument(document: NewDocument): Promise<Document> {
  const newDocument = await db
    .insert(documentsTable)
    .values({ ...document, orgId: document.orgId })
    .returning();
  return newDocument[0];
}

/**
 * Update a document
 */
export async function updateDocument(
  id: Document['id'],
  document: DocumentUpdateInput,
): Promise<Document> {
  const updatedDocument = await db
    .update(documentsTable)
    .set(document)
    .where(eq(documentsTable.id, id))
    .returning();
  return updatedDocument[0];
}

/**
 * Delete a document
 * @param id - The ID of the document to delete
 */
export async function deleteDocument(id: Document['id']): Promise<void> {
  await db.delete(documentsTable).where(eq(documentsTable.id, id));
}

/**
 * Delete a document and its associated storage file (if any)
 * This is the canonical cascade deletion for documents.
 */
export async function deleteDocumentCascade(
  id: Document['id'],
  storagePath: Document['storagePath'],
): Promise<void> {
  if (storagePath) {
    try {
      await storageServer.deleteFile(storagePath);
    } catch (err) {
      // Non-fatal: proceed with DB deletion even if storage removal fails
      console.warn('Warning: failed to delete storage file for document', id, err);
    }
  }
  await deleteDocument(id);
}
