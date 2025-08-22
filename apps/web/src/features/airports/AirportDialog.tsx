import { Badge } from '@/components/ui/badge';
import type { Airport } from '@/drizzle/types';
import { Button } from '@/stories/Button/Button';
import { DetailDialog, DialogSection, KeyValuePair } from '@/stories/Dialog/Dialog';

export default function AirportDialog({ airport }: { airport: Airport }) {
  return (
    <DetailDialog
      trigger={<Button intent="primary" text="View Airport" />}
      title={airport.name}
      onSave={() => {}}
      onOpenChange={() => {}}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DialogSection
          title="Information"
          gradient="from-blue-500 to-green-500"
          children={
            <div className="flex flex-col justify-between">
              <KeyValuePair label="Airport Name" value={airport.name} />
              <KeyValuePair label="IATA" value={<Badge>{airport.iata}</Badge>} />
              <KeyValuePair label="ICAO" value={<Badge>{airport.icao}</Badge>} />
              <KeyValuePair label="Hub" value={airport.isHub ? 'Yes' : 'No'} />
            </div>
          }
        />
        <DialogSection
          title="Location"
          gradient="from-blue-500 to-green-500"
          children={
            <div className="flex flex-col justify-between">
              <KeyValuePair label="City" value={airport.city} />
              <KeyValuePair label="State" value={airport.state} />
              <KeyValuePair label="Country" value={airport.country} />
            </div>
          }
        />
      </div>
    </DetailDialog>
  );
}
