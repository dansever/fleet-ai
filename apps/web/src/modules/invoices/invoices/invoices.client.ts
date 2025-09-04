import type { Contract, Invoice, Organization } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { InvoiceCreateInput, InvoiceUpdateInput } from './invoices.types';

/**
 * Get an invoice by ID
 */
export async function getInvoiceById(id: Invoice['id']): Promise<Invoice> {
  const res = await api.get(`/api/invoices?id=${id}`);
  return res.data;
}

/**
 * Get all invoices for an organization
 */
export async function listInvoicesByOrg(orgId?: Organization['id']): Promise<Invoice[]> {
  const url = orgId ? `/api/invoices?orgId=${orgId}` : '/api/invoices';
  const res = await api.get(url);
  return res.data;
}

/**
 * Get invoices by contract
 */
export async function listInvoicesByContract(contractId: Contract['id']): Promise<Invoice[]> {
  const res = await api.get(`/api/invoices?contractId=${contractId}`);
  return res.data;
}

/**
 * Create a new invoice
 */
export async function createInvoice(data: InvoiceCreateInput): Promise<Invoice> {
  const payload = {
    ...data,
    // Convert string dates to Date objects
    invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
  };
  const res = await api.post('/api/invoices', payload);
  return res.data;
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(id: string, data: InvoiceUpdateInput): Promise<Invoice> {
  const payload = {
    ...data,
    // Convert string dates to Date objects if provided
    invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
  };
  const res = await api.put(`/api/invoices?id=${id}`, payload);
  return res.data;
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/api/invoices?id=${id}`);
}
