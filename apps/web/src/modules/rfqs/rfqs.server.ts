// src/modules/rfqs/rfqs.server.ts
'use server';
import 'server-only';

import { db } from '@/drizzle';
import { OrderDirection, rfqsTable } from '@/drizzle/schema/schema';
import type { NewRfq, Organization, Rfq, UpdateRfq } from '@/drizzle/types';
import { and, desc, eq } from 'drizzle-orm';

/**
 * Get an RFQ by its ID
 */
export async function getRfqById(id: Rfq['id'], orgId: Organization['id']): Promise<Rfq | null> {
  const row = await db.query.rfqsTable.findFirst({
    where: and(eq(rfqsTable.id, id), eq(rfqsTable.orgId, orgId)),
  });

  return row ?? null;
}

/**
 * List all RFQs for an organization by direction (default: 'sent')
 */
export async function listRfqsByDirection(
  direction: OrderDirection = 'sent',
  orgId: Organization['id'],
): Promise<Rfq[]> {
  return db.query.rfqsTable.findMany({
    where: and(eq(rfqsTable.orgId, orgId), eq(rfqsTable.direction, direction)),
    orderBy: desc(rfqsTable.createdAt),
  });
}

/**
 * Create a new RFQ
 */
export async function createRfq(data: NewRfq): Promise<Rfq> {
  const [row] = await db
    .insert(rfqsTable)
    .values({ ...data })
    .returning();
  return row;
}

/**
 * Update an existing RFQ (also bumps updatedAt)
 */
export async function updateRfq(id: Rfq['id'], data: UpdateRfq): Promise<Rfq> {
  const [row] = await db
    .update(rfqsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(rfqsTable.id, id))
    .returning();
  return row;
}

/**
 * Delete an RFQ by ID
 */
export async function deleteRfq(id: Rfq['id']): Promise<void> {
  await db.delete(rfqsTable).where(eq(rfqsTable.id, id));
}
