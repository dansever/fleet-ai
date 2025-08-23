import { Badge } from '@/components/ui/badge';
import type { Rfq } from '@/drizzle/types';
import { formatDate } from '@/lib/core/formatters';
import { Button } from '@/stories/Button/Button';
import { DialogSection, KeyValuePair } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';

export default function RfqDialog({ rfq }: { rfq: Rfq }) {
  return (
    <DetailDialog
      trigger={<Button intent="primary" text="View Rfq" />}
      title={rfq.rfqNumber ?? 'Rfq'}
      onSave={() => {}}
      onOpenChange={() => {}}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DialogSection
          title="Information"
          gradient="from-blue-500 to-green-500"
          children={
            <div className="flex flex-col justify-between">
              <KeyValuePair label="Rfq Number" value={<Badge>{rfq.rfqNumber}</Badge>} />
              <KeyValuePair label="Rfq Status" value={rfq.direction} />
            </div>
          }
        />
        <DialogSection
          title="Location"
          gradient="from-blue-500 to-green-500"
          children={
            <div className="flex flex-col justify-between">
              <KeyValuePair label="Direction" value={rfq.direction} />
              <KeyValuePair label="Created At" value={<Badge>{formatDate(rfq.createdAt)}</Badge>} />
              <KeyValuePair label="Updated At" value={<Badge>{formatDate(rfq.updatedAt)}</Badge>} />
            </div>
          }
        />
      </div>
    </DetailDialog>
  );
}
