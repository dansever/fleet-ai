import { db } from '@/drizzle';
import { OrderDirection, rfqsTable } from '@/drizzle/schema/schema';
import { NewRfq, Organization, Rfq, UpdateRfq, User } from '@/drizzle/types';
import { and, desc, eq } from 'drizzle-orm';

/**
 * Get an RFQ by its ID
 */
export async function getRfqById(id: Rfq['id']): Promise<Rfq | null> {
  const result = await db.select().from(rfqsTable).where(eq(rfqsTable.id, id)).limit(1);
  return result[0] ?? null;
}

/**
 * Get an RFQ by its RFQ number within an organization
 */
export async function getRfqByNumber(orgId: string, rfqNumber: string): Promise<Rfq | null> {
  const result = await db
    .select()
    .from(rfqsTable)
    .where(and(eq(rfqsTable.orgId, orgId), eq(rfqsTable.rfqNumber, rfqNumber)))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get all RFQs for an organization
 */
export async function getRfqsByOrgAndDirection(
  orgId: Organization['id'],
  direction: OrderDirection = 'sent',
): Promise<Rfq[]> {
  const rfqs = await db
    .select()
    .from(rfqsTable)
    .where(and(eq(rfqsTable.orgId, orgId), eq(rfqsTable.direction, direction)))
    .orderBy(desc(rfqsTable.createdAt));
  return rfqs;
}

/**
 * Get all RFQs for a specific user
 */
export async function getUserRfqs(userId: User['id']): Promise<Rfq[]> {
  const rfqs = await db
    .select()
    .from(rfqsTable)
    .where(eq(rfqsTable.userId, userId))
    .orderBy(desc(rfqsTable.createdAt));
  return rfqs;
}

/**
 * Create a new RFQ
 */
export async function createRfq(data: NewRfq): Promise<Rfq> {
  const result = await db.insert(rfqsTable).values(data).returning();
  return result[0];
}

/**
 * Update an RFQ
 */
export async function updateRfq(id: Rfq['id'], data: UpdateRfq): Promise<Rfq> {
  const result = await db
    .update(rfqsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(rfqsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete an RFQ
 */
export async function deleteRfq(id: Rfq['id']): Promise<void> {
  await db.delete(rfqsTable).where(eq(rfqsTable.id, id)).returning();
}
