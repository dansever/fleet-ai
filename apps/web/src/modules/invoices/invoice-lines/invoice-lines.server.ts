'use server';
import 'server-only';

import { db } from '@/drizzle';
import { invoiceLinesTable } from '@/drizzle/schema/schema';
import { Invoice, InvoiceLine, NewInvoiceLine, UpdateInvoiceLine } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get an invoice line by ID
 */
export async function getInvoiceLineById(id: InvoiceLine['id']): Promise<InvoiceLine | null> {
  const result = await db
    .select()
    .from(invoiceLinesTable)
    .where(eq(invoiceLinesTable.id, id))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get all invoice lines for an invoice
 */
export async function listInvoiceLinesByInvoiceId(
  invoiceId: Invoice['id'],
): Promise<InvoiceLine[]> {
  const invoiceLines = await db
    .select()
    .from(invoiceLinesTable)
    .where(eq(invoiceLinesTable.invoiceId, invoiceId));
  return invoiceLines;
}

/**
 * Create a new invoice line
 */
export async function createInvoiceLine(data: NewInvoiceLine): Promise<InvoiceLine> {
  const result = await db.insert(invoiceLinesTable).values(data).returning();
  return result[0];
}

/**
 * Update an invoice line
 */
export async function updateInvoiceLine(
  id: InvoiceLine['id'],
  data: UpdateInvoiceLine,
): Promise<InvoiceLine> {
  const result = await db
    .update(invoiceLinesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoiceLinesTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete an invoice line
 */
export async function deleteInvoiceLine(id: InvoiceLine['id']): Promise<void> {
  await db.delete(invoiceLinesTable).where(eq(invoiceLinesTable.id, id));
}
