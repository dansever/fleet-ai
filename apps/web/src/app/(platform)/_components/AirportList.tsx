import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Airport } from '@/drizzle/types';
import { useCountryMap } from '@/hooks/use-country-map';
import { cn } from '@/lib/utils';
import { defaultCardStyle, selectedCardStyle } from '@/styles/tailwindStyles';
import { Home, Plus, Search, X } from 'lucide-react';
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search airports"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Country Filter */}
        <div className="relative">ADD COUNTRY FILTER</div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="link"
            size="sm"
            onClick={clearFilters}
            className="self-start text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredAirports.length} of {airports.length} airports
        </div>
      </div>

      {/* Airport List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {filteredAirports.map((airport) => (
              <AirportListitem
                key={airport.id}
                airport={airport}
                selectedAirport={selectedAirport}
                onAirportSelect={onAirportSelect}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface AirportListitemProps {
  airport: Airport;
  selectedAirport: Airport | null;
  onAirportSelect: (airport: Airport) => void;
}

function AirportListitem({ airport, selectedAirport, onAirportSelect }: AirportListitemProps) {
  const isActive = selectedAirport?.id === airport.id;

  return (
    <Card
      key={airport.id}
      className={cn(
        'cursor-pointer transition-colors',
        defaultCardStyle,
        isActive && selectedCardStyle,
      )}
      onClick={() => {
        onAirportSelect(airport);
      }}
    >
      <CardHeader className="p-0 flex flex-row justify-between gap-2">
        <CardTitle className="flex flex-col gap-2 items-start justify-between">
          <div className="flex items-center gap-2">
            {airport.isHub && <Home className="h-4 w-4 text-yellow-600 stroke-2" />}
            {airport.name}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {airport.city}, {airport.country}
          </p>
        </CardTitle>

        <div className="flex flex-col items-end gap-2">
          {airport.iata && (
            <Badge variant="outline" className="font-mono">
              {airport.iata}
            </Badge>
          )}
          {airport.icao && (
            <Badge variant="outline" className="font-mono">
              {airport.icao}
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
