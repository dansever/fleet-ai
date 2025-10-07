# Context Provider Document Loading Fix

## Issue

Documents were not loading automatically when a contract was selected on initial page load. Users had to manually refresh the page or explicitly trigger a refresh for documents to appear.

## Root Causes

### 1. **Missing Dependencies in useEffect Hooks**

The `useEffect` hooks for loading contracts, contacts, and documents were missing the `cleanupCache` dependency. This could cause **stale closures** where the effects would reference old versions of the cleanup function, potentially preventing proper cache management and data loading.

**Before:**

```typescript
}, [selectedAirport]); // Missing cleanupCache dependency
```

**After:**

```typescript
}, [selectedAirport, cleanupCache]); // Include cleanupCache to avoid stale closures
```

### 2. **Inconsistent Cache Checks**

The cache checks were inconsistent across different loading functions:

- Contracts: `if (contractsCache[selectedAirport.id])` (truthy check)
- Documents: `if (documentsCache[selectedContract.id] !== undefined)` (explicit undefined check)

While both should work in most cases, using `!== undefined` is more explicit and handles edge cases better (e.g., if we ever need to store null values).

**After (all consistent):**

```typescript
if (contractsCache[selectedAirport.id] !== undefined) { ... }
if (vendorContactsCache[selectedAirport.id] !== undefined) { ... }
if (documentsCache[selectedContract.id] !== undefined) { ... }
```

### 3. **Lack of Debugging Information**

There was no logging to help debug the data loading flow, making it difficult to identify where the issue was occurring.

## Solution

### Changes Made

1. **Added `cleanupCache` to all useEffect dependencies:**
   - Contracts loading effect (line 327)
   - Vendor contacts loading effect (line 392)
   - Documents loading effect (line 455)

2. **Made cache checks consistent:**
   - All now use `!== undefined` for explicit checking
   - Added console logs when loading from cache

3. **Added comprehensive logging:**
   - Log when starting to load data
   - Log when data is loaded from cache
   - Log when data is successfully fetched from server
   - Log contract selection events

4. **Improved documentation:**
   - Added flow documentation to useEffect hooks
   - Clarified that documents load automatically when contracts are selected

### Data Loading Flow

#### On Initial Page Load:

```
1. Airports load (from server or initial data)
   ↓
2. First airport is auto-selected
   ↓
3. Contracts load for that airport (cache or server)
   ↓
4. First contract is auto-selected
   ↓
5. Documents load for that contract (cache or server) ✓ NOW WORKS RELIABLY
   ↓
6. First document is auto-selected
```

#### On Airport Switch:

```
1. Clear all contracts, documents, and selections
   ↓
2. Load contracts for new airport (cache or server)
   ↓
3. Auto-select first contract
   ↓
4. Documents load automatically (cache or server) ✓
   ↓
5. Auto-select first document
```

#### On Contract Switch:

```
1. Clear documents and selection
   ↓
2. Load documents for new contract (cache or server) ✓
   ↓
3. Auto-select first document
```

## Console Logging

With the new logging, you can trace the data flow in the browser console:

```
Loading contracts for airport abc-123...
Successfully loaded 5 contracts for airport abc-123
Contract selected: contract-456, loading documents...
Loading documents for contract contract-456...
Successfully loaded 3 documents for contract contract-456
```

Or when using cache:

```
Loaded 5 contracts from cache for airport abc-123
Contract selected: contract-456, loading documents...
Loaded 3 documents from cache for contract contract-456
```

## Cache Management

The cache now works properly with the correct dependencies:

- **Contracts Cache**: Keyed by airport ID
- **Documents Cache**: Keyed by contract ID
- **Vendor Contacts Cache**: Keyed by airport ID

Each cache:

- Stores fetched data to avoid re-fetching
- Is cleared on manual refresh operations
- Is automatically cleaned up when it exceeds thresholds
- Is properly referenced in useEffect dependencies

## Testing

To verify the fix works:

1. **Initial Load Test:**
   - Open the Airport Hub page
   - Check that contracts load
   - Verify documents appear automatically without manual refresh
   - Check console for proper log sequence

2. **Airport Switch Test:**
   - Select a different airport
   - Verify contracts and documents load automatically
   - Check that the first document is selected

3. **Contract Switch Test:**
   - Select a different contract within the same airport
   - Verify documents load immediately
   - Check that the first document is selected

4. **Cache Test:**
   - Switch to a different airport
   - Switch back to the original airport
   - Should load from cache (check console logs)
   - Documents should still load automatically

5. **Upload Test:**
   - Upload a new document to a contract
   - Verify documents refresh automatically
   - New document should appear in the list

## Performance Impact

- **Positive:** Documents now load automatically without user intervention
- **Neutral:** Console logs add minimal overhead (can be removed in production)
- **Neutral:** Adding `cleanupCache` to dependencies doesn't cause extra re-renders since it's memoized with stable dependencies

## Future Enhancements

1. **Remove console logs in production** - Add conditional logging based on environment
2. **Add loading indicators** - Show spinners while documents are loading
3. **Error recovery** - Add retry logic for failed document loads
4. **Optimistic updates** - Show newly uploaded documents immediately before refresh
5. **Prefetching** - Preload documents for other contracts in the background

## Related Files

- `apps/web/src/app/(platform)/airport-hub/ContextProvider.tsx` - Main fix location
- `apps/web/src/app/(platform)/airport-hub/_components/ContractFiles.tsx` - Document display component
- `apps/web/src/modules/documents/documents.ts` - Document API client
