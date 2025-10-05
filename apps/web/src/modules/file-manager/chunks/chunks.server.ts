// Chunks server-side operations

'use server';
import 'server-only';

import { db } from '@/drizzle';
import { chunksTable } from '@/drizzle/schema/schema.documents';
import { Document } from '@/drizzle/types';
import { prepareChunksForDocument } from '@/lib/ai/rag/ingest';
import { eq } from 'drizzle-orm';

export async function createDocumentChunks(document: Pick<Document, 'id' | 'orgId' | 'content'>) {
  if (!document) throw new Error('Document not found');
  if (!document.content?.trim()) throw new Error('No extracted text to chunk');

  const { rows } = await prepareChunksForDocument({
    orgId: document.orgId,
    documentId: document.id,
    content: document.content,
  });

  await db.transaction(async (tx) => {
    await tx.delete(chunksTable).where(eq(chunksTable.documentId, document.id));
    if (rows.length) await tx.insert(chunksTable).values(rows);
  });

  return { inserted: rows.length, documentId: document.id };
}
