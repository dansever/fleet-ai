'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FuelBid, NewFuelBid } from '@/drizzle/types';
import { createRandomFuelBid } from '@/features/fuel/bid/createRandomBid';
import { convertPydanticToFuelBid } from '@/features/fuel/bid/pydanticConverter';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { DataTable } from '@/stories/DataTable/DataTable';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { FileText, RefreshCw, Upload } from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { useFuelProcurement } from '../contexts';
import { useFuelBidColumns } from './FuelBidsDataTableColumns';

interface FuelBidsDataTableProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const FuelBidsDataTable = memo(function FuelBidsDataTable({
  onRefresh,
  isRefreshing,
}: FuelBidsDataTableProps) {
  const { tenders, fuelBids } = useFuelProcurement();
  const { selectedTender } = tenders;
  const { fuelBids: bids, addFuelBid } = fuelBids;
  const [newBid, setNewBid] = useState<NewFuelBid | null>(null);
  const fuelBidColumns = useFuelBidColumns();
  const [uploadFuelBidPopoverOpen, setUploadFuelBidPopoverOpen] = useState(false);

  if (!selectedTender) {
    return null;
  }

  const handleSendFuelBidFile = async (file: File) => {
    try {
      const result = await fuelBidClient.extractFuelBid(file);
      const convertedBid = convertPydanticToFuelBid(result, selectedTender.id);
      const createdBid = await fuelBidClient.createFuelBid(selectedTender.id, convertedBid);
      addFuelBid(createdBid);
      toast.success('Fuel bid extracted successfully');
    } catch (error) {
      toast.error('Error extracting fuel bid');
    }
  };

  return (
    <BaseCard>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Fuel Bids
          </CardTitle>
          <p className="text-slate-600 mt-1">
            Compare and evaluate fuel bids for {selectedTender?.title}
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button
              intent="ghost"
              icon={RefreshCw}
              onClick={onRefresh}
              disabled={isRefreshing}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          )}
          <FileUploadPopover
            open={uploadFuelBidPopoverOpen}
            onOpenChange={setUploadFuelBidPopoverOpen}
            trigger={<Button intent="secondary" text="Upload Bid" icon={Upload} size="md" />}
            onSend={handleSendFuelBidFile}
          >
            <Button
              intent="ghost"
              text="Or generate random Bid"
              size="sm"
              className="text-gray-500"
              onClick={async () => {
                const bid = await createRandomFuelBid(selectedTender.id);
                addFuelBid(bid as FuelBid);
                setUploadFuelBidPopoverOpen(false);
              }}
            />
          </FileUploadPopover>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={bids}
          columns={fuelBidColumns}
          searchable={true}
          pagination={true}
          pageSize={10}
          onRowClick={() => {}}
          csvDownload={true}
        />
      </CardContent>
    </BaseCard>
  );
});

export default FuelBidsDataTable;
