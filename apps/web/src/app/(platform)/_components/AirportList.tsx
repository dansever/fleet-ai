'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import { Airport } from '@/drizzle/types';
import AirportDialog from '@/features/airports/AirportDialog';
import { useCountryMap } from '@/hooks/use-country-map';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { ListItemCard } from '@/stories/Card/Card';
import { ModernInput, ModernSelect } from '@/stories/Form/Form';
import { Home, Plane, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AirportListProps {
  airports: Airport[];
  onAirportSelect: (airport: Airport) => void;
  selectedAirport: Airport | null;
  InsertAddAirportButton: boolean;
  onAirportAdd?: (airport: Airport) => void;
}

export default function AirportList({
  airports,
  onAirportSelect,
  selectedAirport,
  InsertAddAirportButton = false,
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
    let filtered = airports.filter((airport: Airport) => {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-light italic">Airports</h1>
          {InsertAddAirportButton && (
            <AirportDialog
              airport={null}
              DialogType="add"
              onChange={(newAirport) => {
                if (onAirportAdd) {
                  onAirportAdd(newAirport);
                  // Automatically select the newly created airport
                  onAirportSelect(newAirport);
                }
              }}
              buttonSize="sm"
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{airports.length} Airports</p>
      </div>

      {/* Search Input */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border flex flex-col gap-2">
        <h3 className="font-light">Filters</h3>

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
            {filteredAirports.map((airport) => (
              <ListItemCard
                key={airport.id}
                isSelected={selectedAirport?.id === airport.id}
                onClick={() => onAirportSelect(airport)}
                icon={airport.isHub ? <Home /> : <Plane />}
                iconBackground={
                  airport.isHub ? 'from-yellow-400 to-yellow-200' : 'from-blue-300 to-blue-200'
                }
              >
                <div className="flex flex-row gap-2">
                  {/* Left side: main airport info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      <span className="text-sm font-medium">{airport.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {airport.city && `${airport.city}`}
                      {airport.state && `, ${airport.state}`}
                      {airport.country && `, ${airport.country}`}
                    </span>
                  </div>
                  {/* Right side: badges */}
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline">{airport.iata}</Badge>
                    <Badge variant="outline">{airport.icao}</Badge>
                  </div>
                </div>
              </ListItemCard>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
