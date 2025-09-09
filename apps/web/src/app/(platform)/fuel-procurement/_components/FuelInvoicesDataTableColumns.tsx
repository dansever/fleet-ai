import { Invoice } from '@/drizzle/types';
import { Column } from '@/stories/DataTable/DataTable';
import { useMemo } from 'react';

export const useFuelInvoicesColumns = (): Column<Invoice>[] => {
  return useMemo(
    () => [
      {
        key: 'invoice-number',
        header: <span className="whitespace-nowrap">Invoice Number</span>,
        accessor: (invoice: Invoice) => (
          <div className="space-y-1">
            <h3>{invoice.invoiceNumber}</h3>
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        key: 'vendor-name',
        header: <span className="whitespace-nowrap">Vendor Name</span>,
        accessor: (invoice: Invoice) => (
          <div className="space-y-1">
            <h3>{invoice.vendorName}</h3>
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        key: 'invoice-date',
        header: <span className="whitespace-nowrap">Invoice Date</span>,
        accessor: (invoice: Invoice) => (
          <div className="space-y-1">
            <h3>{invoice.invoiceDate}</h3>
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        key: 'total-amount',
        header: <span className="whitespace-nowrap">Total Amount</span>,
        accessor: (invoice: Invoice) => (
          <div className="space-y-1">
            {/* <h3>{formatCurrency(invoice.totalAmount, invoice.currency)}</h3> */}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
    ],
    [],
  );
};
