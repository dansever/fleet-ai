import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Airport } from '@/drizzle/types';
import { Button } from '@/stories/Button/Button';
import { PanelLeftOpen } from 'lucide-react';

interface AirportsPanelProps {
  airports: Airport[];
  selectedAirport: Airport | null;
  onAirportSelect: (airport: Airport) => void;
  onAirportAdd: (airport: Airport) => void;
}

export default function AirportsPanel({
  airports,
  selectedAirport,
  onAirportSelect,
  onAirportAdd,
}: AirportsPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          intent="secondary"
          size="lg"
          text={selectedAirport?.name}
          icon={PanelLeftOpen}
          className={cn(
            'gap-2 hover:scale-100 shadow-none hover:shadow-md',
            'bg-gradient-to-r from-blue-200/40 via-violet-300/40 to-orange-200/40',
          )}
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-card gap-0 p-0 [&>button:first-of-type]:hidden flex flex-col h-full data-[state=closed]:duration-200 data-[state=open]:duration-200"
      >
        <div className="px-4 py-2 flex flex-row justify-between items-center flex-shrink-0">
          <SheetTitle className="">Airport Information</SheetTitle>
          <AirportDialog
            airport={null}
            DialogType="add"
            trigger={<Button intent="add" text="Add" icon={Plus} />}
            onChange={(newAirport) => {
              onAirportAdd(newAirport);
            }}
          />
        </div>
        <div className="flex-1 min-h-0">
          <AirportList
            airports={airports}
            onAirportSelect={onAirportSelect}
            selectedAirport={selectedAirport}
            onAirportAdd={onAirportAdd}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import AirportDialog from '@/features/airports/AirportDialog';
import { useCountryMap } from '@/hooks/use-country-map';
import { cn } from '@/lib/utils';
import { ListItemCard } from '@/stories/Card/Card';
import { ModernInput, ModernSelect } from '@/stories/Form/Form';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Home, Plane, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AirportListProps {
  airports: Airport[];
  onAirportSelect: (airport: Airport) => void;
  selectedAirport: Airport | null;
  onAirportAdd?: (airport: Airport) => void;
}

export function AirportList({
  airports,
  onAirportSelect,
  selectedAirport,
  onAirportAdd,
}: AirportListProps) {
  const { map: countryMap, isLoading: countryMapLoading } = useCountryMap();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Create country options for multi-select
  const countryOptions = useMemo(() => {
    const uniqueCountries = [...new Set(airports.map((airport) => airport.country))];
    return uniqueCountries
      .filter((country) => country) // Remove null/undefined countries
      .map((country) => ({
        value: country,
        label: countryMap[country] || country, // Use full country name from map if available
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically
  }, [airports, countryMap]);

  // Filter and sort airports
  const filteredAirports = useMemo(() => {
    const filtered = airports.filter((airport: Airport) => {
      // Apply search filter
      const matchesSearch =
        !searchTerm ||
        airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.iata?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.icao?.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply country filter
      const matchesCountry =
        selectedCountries.length === 0 || selectedCountries.includes(airport.country);

      return matchesSearch && matchesCountry;
    });

    // Sort alphabetically by name (ascending)
    return filtered.sort((a, b) => {
      if (a.isHub && !b.isHub) return -1;
      if (!a.isHub && b.isHub) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [airports, searchTerm, selectedCountries]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountries([]);
  };

  const hasActiveFilters = searchTerm || selectedCountries.length > 0;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Filters */}
      <div className="flex-shrink-0 px-0 py-2 border-b border-border flex flex-col gap-2 px-4">
        {/* Search Input */}
        <div className="relative">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /> */}
          <ModernInput
            placeholder="Search airports"
            icon={<Search />}
            className="w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Country Filter */}
        <div className="flex flex-row gap-2 items-center justify-between">
          <ModernSelect
            options={countryOptions}
            placeholder="Select Country"
            onValueChange={(value: string) => setSelectedCountries(value.split(','))}
            value={selectedCountries.join(',')}
          />

          {/* Clear Filters */}
          <Button
            intent="ghost"
            size="sm"
            icon={X}
            text="Clear"
            className="font-semibold hover:bg-transparent hover:underline"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredAirports.length} of {airports.length} airports
        </div>
      </div>

      {/* Airport List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full overflow-y-auto">
          {/* Smoothly adjust inner padding as the sidebar width animates */}
          <div
            className={cn(
              'p-3 space-y-3 transition-[padding,opacity] duration-200 ease-in-out',
              !isCollapsed && 'pl-2',
            )}
          >
            {filteredAirports.map((airport) => {
              const isSelected = selectedAirport?.id === airport.id;
              return (
                <ListItemCard
                  key={airport.id}
                  isSelected={isSelected}
                  onClick={() => onAirportSelect(airport)}
                  icon={airport.isHub ? <Home /> : <Plane />}
                  iconBackgroundClassName={
                    airport.isHub ? 'from-yellow-400 to-yellow-200' : 'from-blue-300 to-blue-200'
                  }
                >
                  <div className="flex flex-row gap-2">
                    {/* Left side: main airport info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium">{airport.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {airport.city && `${airport.city}`}
                        {airport.state && `, ${airport.state}`}
                        {airport.country && `, ${airport.country}`}
                      </span>
                    </div>
                    {/* Right side: badges */}
                    <div className="flex flex-col gap-2 items-end">
                      <StatusBadge status={'secondary'} text={airport.iata} />
                      <StatusBadge status={'secondary'} text={airport.icao} />
                    </div>
                  </div>
                </ListItemCard>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
