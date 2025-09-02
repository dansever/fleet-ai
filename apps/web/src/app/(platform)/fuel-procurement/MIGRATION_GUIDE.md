# Fuel Procurement Context Migration Guide

## Overview

The fuel procurement context has been refactored from a single large context provider to a modular architecture with domain-specific contexts and custom hooks.

## New Architecture

### File Structure

```
contexts/
├── AirportContext.tsx          # Airport-specific state management
├── FuelProcurementContext.tsx  # Main orchestrator context
└── index.ts                    # Export all contexts
hooks/
├── useFuelTenders.ts          # Fuel tender data fetching
├── useFuelBids.ts             # Fuel bid data fetching
├── useInvoices.ts             # Invoice data fetching
└── index.ts                   # Export all hooks
utils/
├── cacheManager.ts            # Centralized caching utility
```

### Key Changes

#### 1. **Context Structure**

**Old:**

```typescript
const { airports, selectedAirport, tenders, fuelBids, invoices } = useFuelProcurement();
```

**New:**

```typescript
const { airports, tenders, fuelBids, invoices } = useFuelProcurement();
const { selectedAirport, loading, error } = airports;
const { tenders: fuelTenders, selectedTender } = tenders;
```

#### 2. **Data Access Pattern**

**Old:**

```typescript
// Direct access to all data
const { airports, selectedAirport, loading, errors } = useFuelProcurement();
```

**New:**

```typescript
// Domain-specific access
const { airports } = useFuelProcurement();
const { selectedAirport, loading, error } = airports;
const { tenders } = useFuelProcurement();
const { loading: tenderLoading, error: tenderError } = tenders;
```

#### 3. **Loading States**

**Old:**

```typescript
const { loading } = useFuelProcurement();
if (loading.airports) return <div>Loading airports...</div>;
if (loading.tenders) return <div>Loading tenders...</div>;
```

**New:**

```typescript
const { airports, tenders } = useFuelProcurement();
if (airports.loading) return <div>Loading airports...</div>;
if (tenders.loading) return <div>Loading tenders...</div>;
```

#### 4. **Error Handling**

**Old:**

```typescript
const { errors } = useFuelProcurement();
if (errors.airports) return <div>Error: {errors.airports}</div>;
```

**New:**

```typescript
const { airports } = useFuelProcurement();
if (airports.error) return <div>Error: {airports.error}</div>;
```

## Migration Steps

### Step 1: Update Imports

```typescript
// Old
import { useFuelProcurement } from './ContextProvider';

// New
import { useFuelProcurement } from './contexts';
```

### Step 2: Update Data Access

```typescript
// Old
const { airports, selectedAirport, loading, errors } = useFuelProcurement();

// New
const { airports } = useFuelProcurement();
const { selectedAirport, loading, error } = airports;
```

### Step 3: Update Component Logic

```typescript
// Old
if (loading.airports) return <div>Loading...</div>;
if (errors.airports) return <div>Error: {errors.airports}</div>;

// New
if (airports.loading) return <div>Loading...</div>;
if (airports.error) return <div>Error: {airports.error}</div>;
```

## Benefits of New Architecture

1. **Separation of Concerns**: Each context/hook has a single responsibility
2. **Reusability**: Custom hooks can be reused across different components
3. **Testability**: Smaller, focused units are easier to test
4. **Performance**: Better memoization and reduced re-renders
5. **Maintainability**: Easier to understand and modify individual pieces
6. **Scalability**: Easy to add new features without affecting existing code

## Usage Examples

### Basic Usage

```typescript
function MyComponent() {
  const { airports, tenders, fuelBids } = useFuelProcurement();

  return (
    <div>
      <h1>{airports.selectedAirport?.name}</h1>
      <p>Loading: {airports.loading ? 'Yes' : 'No'}</p>
      <p>Error: {airports.error || 'None'}</p>
    </div>
  );
}
```

### Advanced Usage

```typescript
function FuelTendersComponent() {
  const { tenders } = useFuelProcurement();
  const { tenders: fuelTenders, selectedTender, loading, error } = tenders;

  if (loading) return <div>Loading tenders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {fuelTenders.map(tender => (
        <div key={tender.id}>{tender.name}</div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Type Errors**: Make sure to access data through the correct context structure
2. **Missing Properties**: Check that you're accessing the right level of the context
3. **Loading States**: Use domain-specific loading states instead of the old global loading object

### Getting Help

If you encounter issues during migration:

1. Check the new context structure in `contexts/FuelProcurementContext.tsx`
2. Review the hook implementations in the `hooks/` directory
3. Refer to the usage examples above
4. Check the TypeScript types for the correct property access
