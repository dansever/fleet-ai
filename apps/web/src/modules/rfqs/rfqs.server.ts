// src/modules/rfqs/rfqs.server.ts
'use server';
import 'server-only';

import { db } from '@/drizzle';
import { OrderDirection, rfqsTable } from '@/drizzle/schema';
import type { NewRfq, Organization, Rfq, UpdateRfq, User } from '@/drizzle/types';
import { and, desc, eq } from 'drizzle-orm';

/**
 * Get an RFQ by its ID
 */
export async function getRfqById(id: Rfq['id']): Promise<Rfq | null> {
  const rows = await db.select().from(rfqsTable).where(eq(rfqsTable.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Get an RFQ by its RFQ number within an organization
 */
export async function getRfqByNumber(
  orgId: Organization['id'],
  rfqNumber: Rfq['rfqNumber'],
): Promise<Rfq | null> {
  const rows = await db
    .select()
    .from(rfqsTable)
    .where(and(eq(rfqsTable.orgId, orgId), eq(rfqsTable.rfqNumber, rfqNumber ?? '')))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * List all RFQs for an organization by direction (default: 'sent')
 */
export async function listOrgRfqsByDirection(
  orgId: Organization['id'],
  direction: OrderDirection = 'sent',
): Promise<Rfq[]> {
  return db
    .select()
    .from(rfqsTable)
    .where(and(eq(rfqsTable.orgId, orgId), eq(rfqsTable.direction, direction)))
    .orderBy(desc(rfqsTable.createdAt));
}

/**
 * List all RFQs created by a specific user
 */
export async function listUserRfqs(userId: User['id']): Promise<Rfq[]> {
  return db
    .select()
    .from(rfqsTable)
    .where(eq(rfqsTable.userId, userId))
    .orderBy(desc(rfqsTable.createdAt));
}

/**
 * Create a new RFQ
 */
export async function createRfq(data: NewRfq): Promise<Rfq> {
  const [row] = await db.insert(rfqsTable).values(data).returning();
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
