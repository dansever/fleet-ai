'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import { Airport } from '@/drizzle/types';
import { useCountryMap } from '@/hooks/use-country-map';
import { cn } from '@/lib/utils';
import { ListItemCard } from '@/stories/Card/Card';
import { ModernInput, ModernSelect } from '@/stories/Form/Form';
import { Home, Plane, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AirportListProps {
  airports: Airport[];
  onAirportSelect: (airport: Airport) => void;
  selectedAirport: Airport | null;
  InsertAddAirportButton: boolean;
}

export default function AirportList({
  airports,
  onAirportSelect,
  selectedAirport,
  InsertAddAirportButton = false,
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
        <div className="flex flex-row justify-between">
          <h1 className="font-light italic">Airports</h1>
          {InsertAddAirportButton && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Airport
            </Button>
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
            onValueChange={(value: string) => setSelectedCountries(value.split(','))}
            value={selectedCountries.join(',')}
          />

          {/* Clear Filters */}

          <Button
            variant="link"
            size="sm"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredAirports.length} of {airports.length} airports
        </div>
      </div>

      {/* Airport List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          {/* Smoothly adjust inner padding as the sidebar width animates */}
          <div
            className={cn(
              'p-4 space-y-3 transition-[padding,opacity] duration-200 ease-in-out',
              !isCollapsed && 'px-2',
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
