// src/modules/quotes/quotes.server.ts
'use server';
import 'server-only';

import { db } from '@/drizzle';
import { quotesTable } from '@/drizzle/schema/schema';
import type { NewQuote, Organization, Quote, Rfq, UpdateQuote } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get a Quote by its ID
 */
export async function getQuoteById(id: Quote['id']): Promise<Quote | null> {
  const rows = await db.select().from(quotesTable).where(eq(quotesTable.id, id)).limit(1);
  return rows[0] ?? null;
}
// Backward compatible alias (to be removed after call sites are updated)
export const getQuote = getQuoteById;

/**
 * List quotes for a given RFQ within an organization.
 */
export async function listQuotesByOrgIdAndRfqId(
  orgId: Organization['id'],
  rfqId: Rfq['id'],
): Promise<Quote[]> {
  return db.query.quotesTable.findMany({
    where: (q, { eq }) => eq(q.orgId, orgId) && eq(q.rfqId, rfqId),
    orderBy: (q, { desc }) => [desc(q.createdAt)],
  });
}

/**
 * Find quotes by RFQ within an organization
 */
export async function listQuotesByRfqId(
  orgId: Organization['id'],
  rfqId: Rfq['id'],
): Promise<Quote[]> {
  return listQuotesByOrgIdAndRfqId(orgId, rfqId);
}

/**
 * Create a new Quote
 */
export async function createQuote(data: NewQuote): Promise<Quote> {
  const [row] = await db.insert(quotesTable).values(data).returning();
  return row;
}

/**
 * Update an existing Quote (also bumps updatedAt)
 */
export async function updateQuote(id: Quote['id'], data: UpdateQuote): Promise<Quote> {
  const [row] = await db
    .update(quotesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quotesTable.id, id))
    .returning();
  return row;
}

/**
 * Delete a Quote by ID
 */
export async function deleteQuote(id: Quote['id']): Promise<void> {
  await db.delete(quotesTable).where(eq(quotesTable.id, id));
}
