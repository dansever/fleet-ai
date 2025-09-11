'use server';
import 'server-only';

import { db } from '@/drizzle';
import { documentsTable } from '@/drizzle/schema/schema.documents';
import { Contract, Document, NewDocument } from '@/drizzle/types';
import { and, eq } from 'drizzle-orm';

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
  const newDocument = await db.insert(documentsTable).values(document).returning();
  return newDocument[0];
}

/**
 * Update a document
 */
export async function updateDocument(document: Document): Promise<Document> {
  const updatedDocument = await db
    .update(documentsTable)
    .set(document)
    .where(eq(documentsTable.id, document.id))
    .returning();
  return updatedDocument[0];
}

/**
 * Get a document by ID
 */
export async function getDocumentById(documentId: string): Promise<Document> {
  const document = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.id, documentId))
    .limit(1);

  if (!document[0]) {
    throw new Error('Document not found');
  }

  return document[0];
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  await db.delete(documentsTable).where(eq(documentsTable.id, documentId));
}
