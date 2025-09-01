import { Invoice } from '@/drizzle/types';
import { DataTable } from '@/stories/DataTable/DataTable';
import { useFuelInvoicesColumns } from './FuelInvoicesDataTableColumns';

export default function FuelInvoicesDataTable(Invoices: Invoice[]) {
  const fuelBidColumns = useFuelInvoicesColumns();

  return (
    <div>
      <DataTable data={[]} columns={fuelBidColumns} />
    </div>
  );
}
