# Fuel Procurement Caching Test Guide

## How to Test Caching Behavior

### 1. Testing Airport Switching Cache

1. **Initial Load**: Navigate to fuel procurement and select an airport (e.g., JFK)
   - Watch network tab - should see API calls for tenders and contracts
   - Note the loading indicators

2. **Switch to Different Airport**: Select another airport (e.g., LAX)
   - Should see new API calls for the new airport
   - Data loads and displays

3. **Switch Back to First Airport**: Select JFK again
   - **Expected**: No API calls in network tab (data served from cache)
   - **Expected**: Loading indicators appear briefly but data loads instantly
   - **Cache TTL**: Tenders (5 min), Contracts (10 min)

### 2. Testing Tender Switching Cache

1. **Select Tender**: Within an airport, select a tender
   - Should see API call for bids
   - Note the loading indicator

2. **Switch to Different Tender**: Select another tender in same airport
   - Should see new API call for new tender's bids

3. **Switch Back to First Tender**: Select the original tender
   - **Expected**: No API call in network tab (served from cache)
   - **Expected**: Instant loading from cache
   - **Cache TTL**: Bids (3 min)

### 3. Testing Cache Invalidation

1. **Create/Update/Delete Data**: Perform CRUD operations on tenders or bids
   - **Expected**: Cache is automatically invalidated for affected airport/tender
   - **Expected**: Next switch to that airport/tender will fetch fresh data

### 4. Testing Force Refresh

1. **Use Refresh Functions**: Click refresh buttons or call refresh methods
   - **Expected**: Bypasses cache and makes fresh API calls
   - **Expected**: Updates cache with fresh data

## Cache Configuration

- **Tenders**: 5 minutes TTL
- **Bids**: 3 minutes TTL
- **Contracts**: 10 minutes TTL
- **Invoices**: 5 minutes TTL

## Performance Benefits

- **Reduced Server Load**: Repeated airport/tender switches don't hit server
- **Faster User Experience**: Instant loading from cache
- **Smart Invalidation**: Cache clears automatically when data changes
- **Configurable TTL**: Different cache durations for different data types
