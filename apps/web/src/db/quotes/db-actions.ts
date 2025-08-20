import { db } from '@/drizzle/db';
import { quotesTable, rfqsTable } from '@/drizzle/schema/schema';
import { NewQuote, Quote, Rfq } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get a quote by its id
 */
export async function getQuoteById(id: Quote['id']): Promise<Quote | null> {
  const quotes = await db
    .select()
    .from(quotesTable)
    .where(eq(quotesTable.id, id));
  return quotes[0] ?? null;
}

/**
 * Get all quotes for an RFQ
 */
export async function getQuotesByRfq(rfqId: Rfq['id']): Promise<Quote[]> {
  const quotes = await db
    .select()
    .from(quotesTable)
    .where(eq(quotesTable.rfqId, rfqId));
  return quotes;
}

/**
 * Update a quote
 */
export async function updateQuote(
  id: Quote['id'],
  data: Partial<NewQuote>,
): Promise<Quote> {
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
 * Get all quotes for an organization (across all RFQs)
 */
export async function getQuotesByOrg(orgId: string): Promise<Quote[]> {
  const quotes = await db
    .select()
    .from(quotesTable)
    .innerJoin(rfqsTable, eq(quotesTable.rfqId, rfqsTable.id))
    .where(eq(rfqsTable.orgId, orgId));
  return quotes.map((row) => row.quotes);
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: Quote['id']): Promise<void> {
  await db.delete(quotesTable).where(eq(quotesTable.id, id)).returning();
}
