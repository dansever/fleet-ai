import AirportDialog from '@/features/airports/AirportDialog';
import { useFuelProcurement } from '../ContextProvider';

export default function FuelTendersPage() {
  const { selectedAirport } = useFuelProcurement();
  if (!selectedAirport) return null;
  return <AirportDialog airport={selectedAirport} />;
}
