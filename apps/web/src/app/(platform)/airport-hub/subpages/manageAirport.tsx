import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { Pencil } from 'lucide-react';
import { useAirportHub } from '../ContextProvider';

export default function ManageAirport() {
  const { selectedAirport } = useAirportHub();

  return (
    <ContentSection
      header={
        <div className="flex items-center gap-2 justify-between w-full">
          <h3>{selectedAirport?.name}</h3>
          <Button
            intent="secondary"
            text="Edit"
            icon={Pencil}
            className="bg-white/20 text-white-700"
          />
        </div>
      }
    >
      <KeyValuePair label="Airport Name" value={selectedAirport?.name || ''} valueType="string" />
      <KeyValuePair label="IATA Code" value={selectedAirport?.iata || ''} valueType="string" />
      <KeyValuePair label="ICAO Code" value={selectedAirport?.icao || ''} valueType="string" />
      <KeyValuePair label="City" value={selectedAirport?.city || ''} valueType="string" />
      <KeyValuePair label="State" value={selectedAirport?.state || ''} valueType="string" />
      <KeyValuePair label="Country" value={selectedAirport?.country || ''} valueType="string" />
      <KeyValuePair label="Notes" value={selectedAirport?.internalNotes || ''} valueType="string" />
      <KeyValuePair
        label="Is Hub"
        value={selectedAirport?.isHub ? 'Yes' : 'No'}
        valueType="string"
      />
    </ContentSection>
  );
}
