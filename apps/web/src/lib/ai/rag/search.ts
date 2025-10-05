// src/lib/ai/rag/search.ts

import { db } from '@/drizzle';
import { chunksTable } from '@/drizzle/schema/schema.documents';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { embedOne } from './embedding';

export async function findRelevantContent(
  orgId: string,
  userQuery: string,
  {
    documentId,
    limit = 8,
    minSim = 0.3,
  }: { documentId?: string; limit?: number; minSim?: number } = {},
) {
  const qvec = await embedOne(userQuery);
  const similarity = sql<number>`1 - (${chunksTable.embedding} <=> ${qvec}::vector)`;

  const whereOrg = eq(chunksTable.orgId, orgId);
  const whereSim = gt(similarity, minSim);
  const whereDoc = documentId ? eq(chunksTable.documentId, documentId) : undefined;
  const whereAll = whereDoc ? and(whereOrg, whereSim, whereDoc) : and(whereOrg, whereSim);

  const rows = await db
    .select({
      id: chunksTable.id,
      content: chunksTable.content,
      meta: chunksTable.meta,
      similarity,
    })
    .from(chunksTable)
    .where(whereAll)
    .orderBy((t) => desc(t.similarity))
    .limit(limit);

  return rows;
}
