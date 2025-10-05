# Airport Hub State Management

## Quick Start

```typescript
// Provider setup
import { AirportHubProvider } from './context';

<AirportHubProvider dbUser={user} initialAirports={airports} hasServerData={true}>
  <App />
</AirportHubProvider>

// Hook usage
import { useAirportHub } from './context';

const { airports, selectedAirport, setSelectedAirport, contracts, documents } = useAirportHub();
```

## Architecture

```
context/
├── index.ts                    # Public API
├── types.ts                    # TypeScript definitions
├── AirportHubContext.tsx       # Main provider orchestrator
├── useAirports.ts              # Airport CRUD & selection
├── useContracts.ts             # Contract management
├── useDocuments.ts             # Document management
├── useVendorContacts.ts        # Vendor contact management
├── useCache.ts                 # Centralized cache utilities
└── useLoadingErrors.ts         # Loading/error state management
```

## Key Features

- **Cache-first data fetching** with automatic cleanup
- **Race condition protection** for document loading
- **Optimistic UI updates** for instant feedback
- **100% API compatibility** - no breaking changes
- **Type-safe** with full TypeScript support

## Data Flow

```
User Action → State Update → Cache Update → UI Update
                    ↓
            Server Request (if needed)
                    ↓
            Response → Validate → Update State & Cache
```

## Cache Strategy

| Domain          | Cache Key    | Lifecycle                     |
| --------------- | ------------ | ----------------------------- |
| Contracts       | `airportId`  | Auto-populate, manual refresh |
| Documents       | `contractId` | Auto-populate, manual refresh |
| Vendor Contacts | `airportId`  | Auto-populate, manual refresh |

**Configuration:**

- `MAX_CACHE_SIZE = 20` items per cache
- `CACHE_CLEANUP_THRESHOLD = 40` triggers cleanup
- Periodic cleanup every 5 minutes

## State Structure

```typescript
// Loading states
loading: {
  airports: boolean;
  contracts: boolean;
  documents: boolean;
  vendorContacts: boolean;
  isRefreshing: boolean;
  uploadDocument: boolean;
}

// Error states
errors: {
  airports: string | null;
  contracts: string | null;
  documents: string | null;
  vendorContacts: string | null;
  general: string | null;
  uploadDocument: string | null;
}
```

## Development Guidelines

### Adding New Features

1. **New domain?** Create `useNewDomain.ts` following existing patterns
2. **New state?** Add to `types.ts` and update `useLoadingErrors.ts`
3. **New cache?** Add to `useCache.ts` and update cleanup logic
4. **New API?** Follow cache-first pattern in domain hooks

### Performance Considerations

- Always check cache before API calls
- Use `cleanupCache()` when updating cache
- Implement race condition protection for async operations
- Update both state and cache on CRUD operations

### Testing

- Test hooks in isolation using React Testing Library
- Mock API clients in `@/modules/*`
- Verify cache behavior with different data sizes
- Test race conditions with rapid selection changes

## Troubleshooting

| Issue                 | Solution                                  |
| --------------------- | ----------------------------------------- |
| Documents not loading | Check console for contract selection logs |
| Cache not working     | Call `clearAllCaches()` to reset          |
| Performance issues    | Monitor cache cleanup logs                |
| Stale data            | Verify cache keys match selected items    |

## Future Improvements

- [ ] Persistent cache in localStorage
- [ ] Background data refresh
- [ ] Request deduplication
- [ ] Smart prefetching
- [ ] Comprehensive unit tests
- [ ] Error retry logic
- [ ] Offline support

## Related Files

- [Document Loading Improvements](../../docs/document-loading-final-improvements.md)
- [Context Provider Fix](../../docs/context-provider-document-loading-fix.md)
- [Contract Files UX](../../docs/contract-files-ux-improvements.md)
