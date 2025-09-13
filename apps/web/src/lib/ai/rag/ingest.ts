// src/lib/ai/rag/ingest.ts

import { randomUUID } from 'crypto';
import { chunkText } from './chunking';
import { embedBatch } from './embedding';

export type PreparedChunkRow = {
  id: string;
  orgId: string;
  documentId: string;
  order: number;
  label: string | null;
  content: string;
  embedding: number[];
  meta: Record<string, any>;
};

export async function prepareChunksForDocument(args: {
  orgId: string;
  documentId: string;
  content: string;
}) {
  const { orgId, documentId, content } = args;

  const chunks = chunkText(content, { targetSize: 900, overlap: 120 });
  const filtered = chunks.filter((c) => c.content.length >= 120);
  if (filtered.length === 0) return { rows: [] as PreparedChunkRow[] };

  const vectors = await embedBatch(
    filtered.map((c) => c.content),
    { maxParallelCalls: 2 },
  );

  const rows: PreparedChunkRow[] = filtered.map((c, i) => ({
    id: randomUUID(),
    orgId,
    documentId,
    order: c.order,
    label: null,
    content: c.content,
    embedding: vectors[i],
    meta: {},
  }));

  return { rows };
}
