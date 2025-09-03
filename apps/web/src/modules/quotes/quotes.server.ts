// src/modules/quotes/quotes.server.ts
'use server';
import 'server-only';

import { db } from '@/drizzle';
import { OrderDirection, quotesTable } from '@/drizzle/schema';
import type { NewQuote, Organization, Quote, Rfq, UpdateQuote } from '@/drizzle/types';
import { and, desc, eq } from 'drizzle-orm';

/**
 * Get a Quote by its ID
 */
export async function getQuoteById(id: Quote['id']): Promise<Quote | null> {
  const rows = await db.select().from(quotesTable).where(eq(quotesTable.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Get a Quote by its RFQ number within an organization
 */
export async function getQuoteByRfqNumber(
  orgId: Organization['id'],
  rfqNumber: Quote['rfqNumber'],
): Promise<Quote | null> {
  const rows = await db
    .select()
    .from(quotesTable)
    .where(and(eq(quotesTable.orgId, orgId), eq(quotesTable.rfqNumber, rfqNumber ?? '')))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * List all Quotes for an organization by direction (default: 'sent')
 */
export async function listOrgQuotesByDirection(
  orgId: Organization['id'],
  direction: OrderDirection = 'sent',
): Promise<Quote[]> {
  return db
    .select()
    .from(quotesTable)
    .where(and(eq(quotesTable.orgId, orgId), eq(quotesTable.direction, direction)))
    .orderBy(desc(quotesTable.createdAt));
}

/**
 * List all Quotes for a specific RFQ
 */
export async function listQuotesByRfq(rfqId: Rfq['id']): Promise<Quote[]> {
  return db
    .select()
    .from(quotesTable)
    .where(eq(quotesTable.rfqId, rfqId))
    .orderBy(desc(quotesTable.createdAt));
}

/**
 * List all Quotes for an organization and RFQ combination
 */
export async function listOrgQuotesByRfq(
  orgId: Organization['id'],
  rfqId: Rfq['id'],
): Promise<Quote[]> {
  return db
    .select()
    .from(quotesTable)
    .where(and(eq(quotesTable.orgId, orgId), eq(quotesTable.rfqId, rfqId)))
    .orderBy(desc(quotesTable.createdAt));
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
