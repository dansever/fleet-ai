# Airport Hub Context Architecture

This directory contains the refactored context management for the Airport Hub feature, split from a single 1133-line file into focused, maintainable modules.

## Structure

```
context/
├── index.ts                    # Public API exports
├── types.ts                    # Type definitions
├── AirportHubContext.tsx       # Main provider component
├── useAirports.ts              # Airport state & operations (~200 lines)
├── useContracts.ts             # Contract state & operations (~280 lines)
├── useDocuments.ts             # Document state & operations (~300 lines)
├── useVendorContacts.ts        # Vendor contact state & operations (~250 lines)
├── useCache.ts                 # Cache management utilities (~115 lines)
└── useLoadingErrors.ts         # Loading/error state management (~60 lines)
```

## Key Features

### 🎯 Separation of Concerns

Each hook focuses on a single domain:

- **useAirports**: Airport CRUD operations and selection
- **useContracts**: Contract management with airport-based filtering
- **useDocuments**: Document management with contract-based filtering
- **useVendorContacts**: Vendor contact management
- **useCache**: Centralized caching with automatic cleanup
- **useLoadingErrors**: Loading and error state management

### 🚀 Performance Optimizations

1. **Intelligent Caching**
   - Cache-first data fetching
   - Automatic cache cleanup when exceeding threshold
   - Periodic maintenance to prevent memory leaks

2. **Race Condition Handling**
   - Document loading includes cleanup logic
   - Stale responses are discarded
   - Contract ID tracking prevents mismatched data

3. **Optimistic UI Updates**
   - Immediate selection changes
   - Cache updates on CRUD operations
   - Smart loading state management

### 🔄 Data Flow

```
User Action → Hook Updates State → Cache Updated → UI Reflects Changes
                                  ↓
                          Server Request (if needed)
                                  ↓
                          Response → Validate → Update State & Cache
```

### 🎨 API Compatibility

The refactoring maintains **100% API compatibility** with the original implementation. All existing components continue to work without changes:

```typescript
import { useAirportHub } from '@/app/(platform)/airport-hub/context';

// Same API as before
const {
  airports,
  selectedAirport,
  setSelectedAirport,
  contracts,
  documents,
  // ... all other properties
} = useAirportHub();
```

## Usage

### In Page Components

```typescript
import { AirportHubProvider } from './context';

export default async function AirportHubPage() {
  const airports = await fetchAirports();

  return (
    <AirportHubProvider
      dbUser={dbUser}
      initialAirports={airports}
      hasServerData={true}
    >
      <YourComponents />
    </AirportHubProvider>
  );
}
```

### In Client Components

```typescript
import { useAirportHub } from '@/app/(platform)/airport-hub/context';

export function MyComponent() {
  const { airports, selectedAirport, setSelectedAirport, loading, errors } = useAirportHub();

  // Use the context values
}
```

## Benefits

✅ **Maintainability**: Each file is 100-300 lines instead of 1133  
✅ **Testability**: Hooks can be tested in isolation  
✅ **Readability**: Clear separation of concerns  
✅ **Reusability**: Shared utilities (cache, loading/errors)  
✅ **Performance**: All optimizations preserved  
✅ **Type Safety**: Full TypeScript support  
✅ **Developer Experience**: Better IDE support and navigation

## Cache Strategy

### Cache Keys

- **Contracts**: Keyed by `airportId`
- **Documents**: Keyed by `contractId`
- **Vendor Contacts**: Keyed by `airportId`

### Cache Lifecycle

- **Populated**: On first data fetch
- **Used**: When switching back to previously viewed item
- **Updated**: On CRUD operations (add, update, remove)
- **Cleared**: On manual refresh or cache size threshold
- **Cleaned**: Periodically every 5 minutes

### Configuration

```typescript
MAX_CACHE_SIZE = 20; // Items to keep per cache
CACHE_CLEANUP_THRESHOLD = 40; // Trigger cleanup at this size
```

## Loading States

The context tracks loading for each domain:

```typescript
loading: {
  airports: boolean;
  contracts: boolean;
  documents: boolean;
  vendorContacts: boolean;
  isRefreshing: boolean;
  uploadDocument: boolean;
}
```

## Error Handling

Each domain has its own error state:

```typescript
errors: {
  airports: string | null;
  contracts: string | null;
  documents: string | null;
  vendorContacts: string | null;
  general: string | null;
  uploadDocument: string | null;
}
```

## Migration Notes

This refactoring:

- ✅ Maintains all existing functionality
- ✅ Preserves all performance optimizations
- ✅ Keeps the same API surface
- ✅ Requires no changes to consuming components
- ✅ Includes all console logging for debugging

## Future Enhancements

1. **Persistent Cache**: Store cache in localStorage
2. **Background Refresh**: Periodically update stale data
3. **Optimistic Mutations**: Show changes before server confirms
4. **Request Deduplication**: Prevent duplicate API calls
5. **Prefetching**: Load data for likely next selections
6. **Unit Tests**: Add comprehensive test coverage

## Troubleshooting

### Documents Not Loading

Check console for:

- `Contract selected: {id}, loading documents...`
- `✓ Loaded X documents from cache` or `⟳ Fetching documents...`
- Ensure contract has a valid `id`

### Cache Not Working

- Check cache size with `clearAllCaches()` to reset
- Monitor console for cache statistics
- Verify cache keys match selected items

### Performance Issues

- Review cache cleanup logs
- Check for memory leaks in browser DevTools
- Monitor network tab for redundant requests

## Related Documentation

- [Document Loading Improvements](../../docs/document-loading-final-improvements.md)
- [Context Provider Fix](../../docs/context-provider-document-loading-fix.md)
- [Contract Files UX](../../docs/contract-files-ux-improvements.md)
