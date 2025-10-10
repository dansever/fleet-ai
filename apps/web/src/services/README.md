# Services Layer

This directory contains reusable business logic services that can be called from API routes, server actions, or other parts of the application.

## Fuel Bid Converter (`fuel-bid-converter.ts`)

Handles the conversion of fuel bids from various currencies and units of measure to a common base for comparison.

### Key Features

1. **Simple Math First**: Common conversions (USG↔L, KG↔LBS) use direct multiplication—no AI overhead
2. **AI Fallback**: Complex or uncommon conversions fall back to the unit converter agent
3. **Parallel Processing**: Processes bids in batches of 3 concurrently for better performance
4. **Comprehensive Error Handling**: Each field conversion is tracked independently

### Architecture

```
Frontend (Tenders.tsx)
    ↓
API Route (route.ts) ← Thin, HTTP-only
    ↓
Service Layer (fuel-bid-converter.ts) ← Business logic
    ↓
Unit Converter Agent (unitConverterAgent.ts) ← AI fallback
```

### Usage

```typescript
import { convertBidsInBatch } from '@/services/fuel-bid-converter';

// Convert multiple bids
const { convertedBids, errors } = await convertBidsInBatch(bids, tender, (progress) => {
  console.log(`Progress: ${progress.completed}/${progress.total}`);
});

// Convert single bid
import { convertBid } from '@/services/fuel-bid-converter';
const convertedBid = await convertBid(bid, tender);
```

### Performance

- **Before**: Sequential processing, 100% AI agent calls
  - 10 bids × 4 fields = 40 AI calls = ~20-40 seconds
- **After**: Parallel processing with simple math
  - 10 bids × 4 fields = ~10 AI calls (75% reduction) = ~5-10 seconds
  - 3x faster with batch processing

### Types

All types are exported from the service:

- `ConvertedBid` - Bid with conversion metadata
- `ConvertedBidField` - Individual field conversion result
- `ConversionProgress` - Progress tracking interface
- `FeeBasisMetadata` - Fee basis notes

### Adding New Conversions

To add new simple conversions (avoiding AI overhead):

```typescript
const SIMPLE_UOM_CONVERSIONS: Record<string, Record<string, number>> = {
  // Add your conversion rates here
  MT: { KG: 1000, LBS: 2204.62 },
  // ...
};
```

### Future Improvements

1. [ ] Add more simple conversion rates (MT, bbl, etc.)
2. [ ] Cache AI agent results for common conversions
3. [ ] Add conversion rate validation/sanity checks
4. [ ] Support real-time exchange rates from external API
5. [ ] Add retry logic for failed conversions
