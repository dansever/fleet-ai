import { Contract, Invoice } from '@/drizzle/types';

export default function createRandomInvoice(contractId: Contract['id']): Invoice {
  return {
    id: '1',
    airportId: null,
    contractId,
    orgId: '1',
    vendorId: null,
    invoiceNumber: 'INV-123456',
    invoiceDate: new Date().toISOString(),
    totalAmount: '1000',
    currency: 'USD',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    docUrl: 'https://www.google.com',
    vendorName: 'John Doe',
    vendorAddress: '123 Main St, Anytown, USA',
    vendorContactName: 'John Doe',
    vendorContactEmail: 'name@email.com',
    vendorContactPhone: '123-456-7890',
    vendorComments:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    periodStart: new Date().toISOString(),
    periodEnd: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
