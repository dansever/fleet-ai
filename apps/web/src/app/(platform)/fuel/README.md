# Fuel Procurement Module

## Overview

The Fuel Procurement module provides a comprehensive solution for managing fuel procurement data including airports, fuel tenders, fuel bids, and invoices. The module uses a modular architecture with domain-specific contexts and custom hooks for optimal performance and maintainability.

## Architecture

### Structure

```
fuel/
├── contexts/                    # Context providers
│   ├── AirportContext.tsx      # Airport state management
│   ├── FuelProcurementContext.tsx # Main orchestrator
│   └── index.ts                # Context exports
├── hooks/                      # Custom data fetching hooks
│   ├── useFuelTenders.ts       # Fuel tender data
│   ├── useFuelBids.ts          # Fuel bid data
│   ├── useInvoices.ts          # Invoice data
│   └── index.ts                # Hook exports
├── utils/                      # Utilities
│   └── cacheManager.ts        # Centralized caching
├── subpages/                   # Feature pages
├── _components/               # Shared components
├── page.tsx                   # Server page
├── ClientPage.tsx             # Client page
├── MIGRATION_GUIDE.md         # Migration guide
└── README.md                  # This file
```

### Key Features

1. **Domain-Specific Contexts**: Each data domain has its own context for better separation of concerns
2. **Custom Hooks**: Reusable hooks for data fetching with built-in caching
3. **Performance Optimized**: Efficient caching and memoization to prevent unnecessary re-renders
4. **Type Safe**: Full TypeScript support with proper type definitions
5. **Error Handling**: Comprehensive error handling at each level
6. **Loading States**: Granular loading states for better UX

## Usage

### Basic Setup

```typescript
import { FuelProcurementProvider } from './contexts';

function App() {
  return (
    <FuelProcurementProvider
      dbUser={user}
      initialAirports={airports}
      hasServerData={true}
    >
      <YourComponents />
    </FuelProcurementProvider>
  );
}
```

### Accessing Data

```typescript
import { useFuelProcurement } from './contexts';

function MyComponent() {
  const { airports, tenders, fuelBids, invoices } = useFuelProcurement();

  // Access airport data
  const { selectedAirport, loading, error } = airports;

  // Access tender data
  const { tenders: fuelTenders, selectedTender } = tenders;

  // Access fuel bid data
  const { fuelBids: bids, loading: bidsLoading } = fuelBids;

  return (
    <div>
      <h1>{selectedAirport?.name}</h1>
      {loading && <div>Loading airports...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## Data Flow

### 1. Airport Selection

- User selects an airport from the sidebar
- `AirportContext` updates the selected airport
- `useFuelTenders` hook automatically fetches tenders for the selected airport

### 2. Tender Selection

- User selects a fuel tender
- `useFuelTenders` updates the selected tender
- `useFuelBids` hook automatically fetches bids for the selected tender

### 3. Data Caching

- All data is cached with a 5-minute TTL
- Cache is automatically invalidated when data is updated
- Manual refresh functions are available for each data type

## API Integration

The module integrates with the following services:

- `@/services/core/airport-client` - Airport data
- `@/services/fuel/fuel-tender-client` - Fuel tender data
- `@/services/fuel/fuel-bid-client` - Fuel bid data
- `@/services/contracts/invoice-client` - Invoice data

## Performance Considerations

1. **Caching**: All data is cached to reduce API calls
2. **Memoization**: Context values are memoized to prevent unnecessary re-renders
3. **Lazy Loading**: Data is only fetched when needed
4. **Optimistic Updates**: UI updates immediately while API calls are in progress

## Error Handling

Each hook and context provides its own error state:

```typescript
const { airports } = useFuelProcurement();
const { error } = airports;

if (error) {
  return <div>Error: {error}</div>;
}
```

## Loading States

Granular loading states for better UX:

```typescript
const { airports, tenders } = useFuelProcurement();

if (airports.loading) return <div>Loading airports...</div>;
if (tenders.loading) return <div>Loading tenders...</div>;
```

## Migration

If you're migrating from the old context provider, see `MIGRATION_GUIDE.md` for detailed instructions.

## Development

### Adding New Features

1. **New Data Type**: Create a new hook in the `hooks/` directory
2. **New Context**: Create a new context in the `contexts/` directory
3. **Integration**: Add the new hook to `FuelProcurementContext.tsx`

### Testing

Each hook and context can be tested independently:

```typescript
// Test a hook
import { renderHook } from '@testing-library/react';
import { useFuelTenders } from './hooks/useFuelTenders';

test('useFuelTenders loads data', () => {
  const { result } = renderHook(() => useFuelTenders({ airportId: 'test' }));
  expect(result.current.loading).toBe(true);
});
```

## Contributing

1. Follow the existing architecture patterns
2. Add proper TypeScript types
3. Include error handling
4. Add loading states
5. Update documentation
6. Test your changes

## Support

For questions or issues:

1. Check the migration guide
2. Review the TypeScript types
3. Look at existing implementations
4. Create an issue with detailed information
