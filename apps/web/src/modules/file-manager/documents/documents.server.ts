'use server';
import 'server-only';

import { db } from '@/drizzle';
import { documentsTable } from '@/drizzle/schema/schema.documents';
import { Contract, Document, NewDocument } from '@/drizzle/types';
import { eq } from 'drizzle-orm';
import { server as storageServer } from '../storage';
import { DocumentUpdateInput } from './documents.types';

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
    .where(eq(documentsTable.contractId, contractId));
  return documents;
}

/**
 * Get all documents for an invoice
 */
export async function listDocumentsByInvoice(invoiceId: string): Promise<Document[]> {
  const documents = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.invoiceId, invoiceId));
  return documents;
}

/**
 * Get all documents for a fuel bid
 */
export async function listDocumentsByFuelBid(fuelBidId: string): Promise<Document[]> {
  const documents = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.fuelBidId, fuelBidId));
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
 * Delete a document and its associated storage file
 * @param id - The ID of the document to delete
 */
export async function deleteDocument(id: Document['id']): Promise<void> {
  try {
    // Step 0: Get the document
    const document = await getDocumentById(id);
    if (!document) throw new Error('Document not found');
    // Step 1: Delete the storage file
    if (document.storagePath) await storageServer.deleteFile(document.storagePath);
    // Step 2: Delete Embeddings
    // TODO: Delete embeddings
    // Step 3: Delete the document
    await db.delete(documentsTable).where(eq(documentsTable.id, id));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}
