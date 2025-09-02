import { Contract, Invoice, NewInvoice } from '@/drizzle/types';
import { api } from '../api-client';

/**
 * Get invoices by contract id
 * @param contractId
 * @returns
 */
export async function getInvoicesByContract(contractId: Contract['id']): Promise<Invoice[]> {
  const res = await api.get(`/api/invoices?contractId=${contractId}`);
  return res.data;
}

/**
 * Create invoice
 * @param contractId
 * @param data
 * @returns
 */
export async function createInvoice(
  contractId: Contract['id'],
  data: NewInvoice,
): Promise<Invoice> {
  const res = await api.post(`/api/invoices?contractId=${contractId}`, data);
  return res.data;
}

/**
 * Update invoice
 * @param id
 * @param data
 */
export async function updateInvoice(id: Invoice['id'], data: Partial<Invoice>): Promise<Invoice> {
  const res = await api.put(`/api/invoices/${id}`, data);
  return res.data;
}

/**
 * Delete invoice
 * @param id
 */
export async function deleteInvoice(id: Invoice['id']): Promise<void> {
  await api.delete(`/api/invoices/${id}`);
}
