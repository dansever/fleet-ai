'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Airport } from '@/drizzle/types';
import { useCountryMap } from '@/hooks/use-country-map';
import { Button } from '@/stories/Button/Button';
import { ListItemCard } from '@/stories/Card/Card';
import { ModernInput, ModernSelect } from '@/stories/Form/Form';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { ChevronDown, Home, Plane, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AirportDropdownProps {
  airports: Airport[];
  selectedAirport: Airport | null;
  onAirportSelect: (airport: Airport) => void;
  className?: string;
}

export default function AirportDropdown({
  airports,
  selectedAirport,
  onAirportSelect,
  className,
}: AirportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { map: countryMap, isLoading: countryMapLoading } = useCountryMap();
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Create country options for multi-select
  const countryOptions = useMemo(() => {
    const uniqueCountries = [...new Set(airports.map((airport) => airport.country))];
    const countryOptions = uniqueCountries
      .filter((country) => country) // Remove null/undefined countries
      .map((country) => ({
        value: country,
        label: countryMap[country] || country, // Use full country name from map if available
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically
    countryOptions.unshift({ value: 'all', label: 'All Countries' });
    return countryOptions;
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

  const handleAirportSelect = (airport: Airport) => {
    onAirportSelect(airport);
    setOpen(false);
    setSearchTerm(''); // Clear search when selecting
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button intent="glass" size="lg" className="gap-2 hover:scale-100">
          <div className="flex items-center gap-2 truncate">
            {selectedAirport?.isHub ? (
              <Home className="h-4 w-4 text-yellow-600" />
            ) : (
              <Plane className="h-4 w-4 text-blue-600" />
            )}
            <span className="truncate">
              {selectedAirport ? selectedAirport.name : 'Select Airport'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[400px] p-0 bg-white rounded-2xl border border-slate-200 overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <div className="flex h-[420px] flex-col">
          {/* Header stays fixed at top of the menu */}
          <div className="p-2 border-b bg-white">
            <div className="flex gap-2">
              <ModernInput
                placeholder="Search airports..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                icon={<Search />}
              />
              <ModernSelect
                options={countryOptions}
                placeholder="Select Country"
                value={selectedCountries.length === 0 ? 'all' : selectedCountries.join(',')}
                onValueChange={(value: string) => {
                  if (value === 'all' || value.split(',').includes('all')) {
                    setSelectedCountries([]);
                    return;
                  }
                  setSelectedCountries(value.split(',').filter(Boolean));
                }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex flex-row justify-between items-center">
              <p>
                {filteredAirports.length} of {airports.length} airports
              </p>
              <Button
                intent="ghost"
                size="sm"
                icon={X}
                disabled={filteredAirports.length === airports.length}
                text="Clear"
                onClick={() => {
                  setSelectedCountries([]);
                  setSearchTerm('');
                }}
                className="underline"
              />
            </div>
          </div>

          {/* Only this area scrolls */}
          <div className="overflow-y-auto">
            <div className="p-2">
              {filteredAirports.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">No airports found</div>
              ) : (
                <div className="space-y-2">
                  {filteredAirports.map((airport) => {
                    const isSelected = selectedAirport?.id === airport.id;
                    return (
                      <ListItemCard
                        key={airport.id}
                        isSelected={isSelected}
                        onClick={() => onAirportSelect(airport)}
                        icon={airport.isHub ? <Home /> : <Plane />}
                        iconBackgroundClassName={
                          airport.isHub
                            ? 'from-yellow-400 to-yellow-200'
                            : 'from-blue-300 to-blue-200'
                        }
                      >
                        <div className="flex flex-row gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium">{airport.name}</span>
                            <span className="block text-xs text-muted-foreground truncate">
                              {airport.city && `${airport.city}`}
                              {airport.state && `, ${airport.state}`}
                              {airport.country && `, ${airport.country}`}
                            </span>
                          </div>
                          <div className="flex items-end flex-col gap-2">
                            <StatusBadge status="secondary" text={airport.iata} />
                            <StatusBadge status="secondary" text={airport.icao} />
                          </div>
                        </div>
                      </ListItemCard>
                    );
                  })}
                </div>
              )}
            </div>{' '}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
