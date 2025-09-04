'use server';
import 'server-only';

import { db } from '@/drizzle';
import { invoicesTable } from '@/drizzle/schema';
import { Contract, Invoice, NewInvoice, Organization, UpdateInvoice } from '@/drizzle/types';
import { desc, eq } from 'drizzle-orm';

/**
 * Get an invoice by ID
 */
export async function getInvoiceById(id: Invoice['id']): Promise<Invoice | null> {
  const result = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
  return result[0] ?? null;
}

/**
 * Get all invoices for an organization
 */
export async function listInvoicesByOrg(orgId: Organization['id']): Promise<Invoice[]> {
  const invoices = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.orgId, orgId))
    .orderBy(desc(invoicesTable.createdAt));
  return invoices;
}

/**
 * Get invoices by contract
 */
export async function listInvoicesByContract(contractId: Contract['id']): Promise<Invoice[]> {
  const invoices = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.contractId, contractId))
    .orderBy(desc(invoicesTable.createdAt));
  return invoices;
}

/**
 * Create a new invoice
 */
export async function createInvoice(data: NewInvoice): Promise<Invoice> {
  const result = await db.insert(invoicesTable).values(data).returning();
  return result[0];
}

/**
 * Update an invoice
 */
export async function updateInvoice(id: Invoice['id'], data: UpdateInvoice): Promise<Invoice> {
  const result = await db
    .update(invoicesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoicesTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: Invoice['id']): Promise<void> {
  await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
}
