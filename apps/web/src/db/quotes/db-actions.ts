import { db } from '@/drizzle/db';
import { quotesTable } from '@/drizzle/schema/schema';
import { NewQuote, Quote, Rfq } from '@/drizzle/types';
import { and, eq } from 'drizzle-orm';

/**
 * Get a quote by its id
 */
export async function getQuoteById(id: Quote['id']): Promise<Quote | null> {
  const quotes = await db.select().from(quotesTable).where(eq(quotesTable.id, id));
  return quotes[0] ?? null;
}

/**
 * Get all quotes for an RFQ
 */
export async function getQuotesByRfq(rfqId: Rfq['id']): Promise<Quote[]> {
  const quotes = await db.select().from(quotesTable).where(eq(quotesTable.rfqId, rfqId));
  return quotes;
}

/**
 * Update a quote
 */
export async function updateQuote(id: Quote['id'], data: Partial<NewQuote>): Promise<Quote> {
  const result = await db
    .update(quotesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quotesTable.id, id))
    .returning();
  return result[0];
}

/**
 * Create a new quote
 */
export async function createQuote(data: NewQuote): Promise<Quote> {
  const result = await db.insert(quotesTable).values(data).returning();
  return result[0];
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: Quote['id']): Promise<void> {
  await db.delete(quotesTable).where(eq(quotesTable.id, id)).returning();
}

/**
 * Get quotes by organization for analysis
 */
export async function getQuotesByOrgForAnalysis(
  orgId: string,
  rfqId: Quote['rfqId'],
): Promise<Quote[]> {
  const quotes = await db
    .select()
    .from(quotesTable)
    .where(and(eq(quotesTable.rfqId, rfqId), eq(quotesTable.orgId, orgId)));
  return quotes;
}
