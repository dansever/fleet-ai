import { Invoice } from '@/drizzle/types';
import { DataTable } from '@/stories/DataTable/DataTable';
import { useFuelInvoicesColumns } from './FuelInvoicesDataTableColumns';

type FuelInvoicesDataTableProps = {
  invoices: Invoice[];
};

export default function FuelInvoicesDataTable({ invoices }: FuelInvoicesDataTableProps) {
  const columns = useFuelInvoicesColumns();

  return (
    <div>
      <DataTable data={invoices} columns={columns} />
    </div>
  );
}
