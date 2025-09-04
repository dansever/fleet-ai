import type { Invoice, InvoiceLine } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { InvoiceLineCreateInput, InvoiceLineUpdateInput } from './invoice-lines.types';

/**
 * Get an invoice line by ID
 */
export async function getInvoiceLineById(id: InvoiceLine['id']): Promise<InvoiceLine> {
  const res = await api.get(`/api/invoice-lines/${id}`);
  return res.data;
}

/**
 * Get all invoice lines for an invoice
 */
export async function listInvoiceLinesByInvoiceId(
  invoiceId?: Invoice['id'],
): Promise<InvoiceLine[]> {
  const url = invoiceId ? `/api/invoice-lines?invoiceId=${invoiceId}` : '/api/invoice-lines';
  const res = await api.get(url);
  return res.data;
}

/**
 * Create a new invoice line
 */
export async function createInvoiceLine(data: InvoiceLineCreateInput): Promise<InvoiceLine> {
  const payload: InvoiceLineCreateInput = {
    ...data,
  };
  const res = await api.post('/api/invoice-lines', payload);
  return res.data;
}

/**
 * Update an existing invoice line
 */
export async function updateInvoiceLine(
  id: InvoiceLine['id'],
  data: InvoiceLineUpdateInput,
): Promise<InvoiceLine> {
  const payload = {
    ...data,
  };
  const res = await api.put(`/api/invoice-lines/${id}`, payload);
  return res.data;
}

/**
 * Delete an invoice line
 */
export async function deleteInvoiceLine(id: InvoiceLine['id']): Promise<void> {
  await api.delete(`/api/invoice-lines/${id}`);
}
