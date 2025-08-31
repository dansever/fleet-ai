import { db } from '@/drizzle';
import { invoicesTable } from '@/drizzle/schema/schema';
import { Airport, Invoice, NewInvoice } from '@/drizzle/types';
import { desc, eq } from 'drizzle-orm';

/**
 * Get invoice by id
 * @param id
 * @returns
 */
export const getInvoice = async (id: Invoice['id']): Promise<Invoice> => {
  const result = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
  return result[0];
};

/**
 * Get invoices by airport
 * @param airportId
 * @returns
 */
export const getInvoicesByAirport = async (airportId: Airport['id']): Promise<Invoice[]> => {
  const result = await db
    .select()
    .from(invoicesTable)
    .orderBy(desc(invoicesTable.createdAt))
    .where(eq(invoicesTable.airportId, airportId));
  return result;
};

/**
 * Update invoice
 * @param id
 * @param data
 * @returns
 */
export const updateInvoice = async (
  id: Invoice['id'],
  data: Partial<Invoice>,
): Promise<Invoice> => {
  const result = await db
    .update(invoicesTable)
    .set(data)
    .where(eq(invoicesTable.id, id))
    .returning();
  return result[0];
};

/**
 * Create invoice
 * @param data
 * @returns
 */
export const createInvoice = async (data: NewInvoice): Promise<Invoice> => {
  const result = await db.insert(invoicesTable).values(data).returning();
  return result[0];
};

/**
 * Delete invoice
 * @param id
 * @returns
 */
export const deleteInvoice = async (id: Invoice['id']): Promise<void> => {
  await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
};
