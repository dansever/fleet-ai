'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAirportAutocomplete } from '@/hooks/use-airport-autocomplete';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { Loader2, MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AirportDatasetItem } from './airportDatasetType';

// import your helpers (make sure these exist)
// If you switched to a CSV-backed country map, expose a sync fallback or pre-load it higher up.
import { useCountryMap } from '@/hooks/use-country-map'; // or wherever you put it
import { ModernInput } from '@/stories/Form/Form';

interface AirportAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (airport: AirportDatasetItem) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function AirportAutocomplete(props: AirportAutocompleteProps) {
  const {
    label,
    placeholder = 'Search airports...',
    value,
    onChange,
    onSelect,
    required = false,
    className,
    disabled = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading } = useAirportAutocomplete({
    query: value,
    enabled: isOpen && value.length >= 2,
    limit: 20,
  });

  const { map: countryMap } = useCountryMap();

  // Ensure highlighted item stays in view
  useEffect(() => {
    if (isOpen && selectedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  // Clamp selectedIndex when suggestions change
  useEffect(() => {
    if (selectedIndex >= suggestions.length) {
      setSelectedIndex(suggestions.length - 1);
    }
  }, [suggestions.length, selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (value.length >= 2) setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Slight delay so clicks inside the popup register
    setTimeout(() => setIsOpen(false), 120);
  };

  const handleSuggestionSelect = (airport: AirportDatasetItem) => {
    onChange(airport.airport);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(airport);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && value.length >= 2) setIsOpen(true);
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) handleSuggestionSelect(suggestions[selectedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearInput = () => {
    onChange('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <Label htmlFor="airport-autocomplete" className="mb-1 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <ModernInput
          ref={inputRef}
          id="airport-autocomplete"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          required={required}
          disabled={disabled}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="airport-listbox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `airport-option-${selectedIndex}` : undefined}
        />
        <div className="bg-white absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {value && !disabled && (
            <Button
              intent="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={clearInput}
              icon={X}
            />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <Card className="bg-white absolute z-50 w-full mt-1 max-h-80 overflow-hidden shadow-lg border">
          <CardContent className="p-0">
            <div
              ref={listRef}
              id="airport-listbox"
              role="listbox"
              className="max-h-80 overflow-y-auto"
            >
              {suggestions.map((airport: AirportDatasetItem, index: number) => {
                const iata = airport.iata;
                const icao = airport.icao;
                const countryName = countryMap[airport.country_code];

                const isActive = index === selectedIndex;

                return (
                  <div
                    key={`${airport.icao || airport.iata}-${index}`}
                    role="option"
                    id={`airport-option-${index}`}
                    aria-selected={isActive}
                    data-index={index}
                    className={cn(
                      'flex items-center justify-between p-3 cursor-pointer border-b border-border/50 last:border-b-0 transition-colors',
                      isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50',
                    )}
                    // Use onMouseDown so the click fires before input onBlur closes the popup
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionSelect(airport);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{airport.airport}</span>
                        {iata && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {iata}
                          </Badge>
                        )}
                        {icao && (
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {icao}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {[airport.region_name, countryName].filter(Boolean).join(', ')}
                        </span>
                      </div>
                      {airport.latitude && airport.longitude && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          <span className="font-mono">
                            {parseFloat(airport.latitude).toFixed(4)},{' '}
                            {parseFloat(airport.longitude).toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && value.length >= 2 && suggestions.length === 0 && !isLoading && (
        <Card className="bg-white absolute z-50 w-full mt-1 shadow-lg border">
          <CardContent className="p-3 text-center text-sm text-muted-foreground">
            No airports found for "{value}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}
