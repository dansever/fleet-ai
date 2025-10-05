# Fuel Utilities

This module provides utilities for managing Fuel Tenders and Bids data, including:

- Bid conversion and normalization
- Data caching with localStorage persistence
- Spreadsheet export functionality

## Features

### Bid Conversion & Caching

- ✅ Automatic bid conversion to tender base currency and units
- ✅ Smart caching with 1-hour TTL to minimize AI conversions
- ✅ localStorage persistence (survives page refreshes)
- ✅ Compact, non-blocking loading overlay
- ✅ Real-time conversion progress tracking

### Spreadsheet Export

- ✅ Convert bid/tender data to spreadsheet format for interactive viewing
- ✅ Export to CSV with proper escaping and formatting
- ✅ Copy data to clipboard for pasting into Excel/Google Sheets
- ✅ Multiple view modes (full, simplified, transposed)
- ✅ Customizable field selection

---

## Bid Conversion & Caching

### Overview

The bid conversion system automatically normalizes all bids to the tender's base currency and unit of measure (UOM). This enables apples-to-apples comparison when bids are submitted in different currencies or units.

### Key Features

1. **Automatic Conversion**: Triggered when bids are loaded
2. **Smart Caching**: Conversions are cached for 1 hour to avoid repeated AI calls
3. **Persistent Storage**: Cache survives page refreshes via localStorage
4. **Non-Blocking UI**: Compact corner overlay allows you to use the rest of the page

### Caching Strategy

The conversion system uses a multi-tiered caching approach:

```typescript
// Cache TTL Configuration
export const CACHE_TTL = {
  TENDERS: 5 * 60 * 1000, // 5 minutes
  BIDS: 3 * 60 * 1000, // 3 minutes
  CONTRACTS: 10 * 60 * 1000, // 10 minutes
  INVOICES: 5 * 60 * 1000, // 5 minutes
  CONVERSIONS: 60 * 60 * 1000, // 60 minutes (1 hour)
} as const;
```

**Why longer TTL for conversions?**

- Conversions are expensive (require AI/API calls)
- Base currency/UOM rarely changes once tender is created
- Reduces API costs and improves performance

### How It Works

1. **First Load**: Bids are converted using AI-powered tools
2. **Subsequent Loads**: Cached conversions are used if available
3. **Cache Expiry**: After 1 hour, conversions are re-run automatically
4. **Manual Refresh**: You can force a refresh by adding new bids or refreshing the page after cache expires

### Usage

#### Basic Usage (Automatic)

The conversion happens automatically when you view a tender with bids. No action required!

#### Programmatic Usage

```typescript
import { convertBidsToTenderBase, getCachedConvertedBids } from '../utils/bidConversion';

// Convert bids with progress tracking
const convertedBids = await convertBidsToTenderBase(bids, tender, (progress) => {
  console.log(`${progress.completed}/${progress.total} bids converted`);
});

// Check if cached conversions exist
const cachedBids = getCachedConvertedBids(tender.id);
if (cachedBids) {
  console.log('Using cached conversions');
}
```

#### Clear Cache

```typescript
import { clearConvertedBidsCache } from '../utils/bidConversion';

// Clear conversions for a specific tender
clearConvertedBidsCache(tender.id);

// Clear all fuel data cache
import { cacheManager } from '../utils/cacheManager';
cacheManager.clear();
```

### Loading Overlay

The conversion loading overlay appears in the bottom-right corner when conversions are running:

- **Position**: Bottom-right (non-blocking)
- **Size**: Compact (384px width)
- **Features**:
  - Real-time progress bar
  - Error tracking
  - Cache duration notice
  - Animated slide-in

### Cache Management

The `CacheManager` class handles all caching with localStorage persistence:

```typescript
// Cache is automatically persisted to localStorage
cacheManager.set('my-key', data, 60 * 60 * 1000); // 1 hour TTL

// Retrieve from cache (checks TTL automatically)
const data = cacheManager.get('my-key', 60 * 60 * 1000);

// Delete specific key
cacheManager.delete('my-key');

// Clear all cache
cacheManager.clear();

// Clear expired entries
cacheManager.clearExpired();
```

### localStorage Structure

Cache entries are stored with the prefix `fuel-cache-`:

```
fuel-cache-converted-bids-tender-123
fuel-cache-tenders-airport-456
fuel-cache-bids-tender-123
```

### Best Practices

1. **Don't Clear Cache Unnecessarily**: Let it expire naturally
2. **Force Refresh Only When Needed**: After updating tender base currency/UOM
3. **Monitor Storage**: Clear old cache if localStorage is getting full
4. **Test in Incognito**: Cache persists across sessions, test fresh loads in incognito mode

---

## Spreadsheet Export Utilities

### Installation

The `react-spreadsheet` library is already installed. The CSS is imported in the Tenders.tsx component:

```tsx
import 'react-spreadsheet/dist/index.css';
```

## Usage

### 1. Exporting Bids to CSV

```tsx
import { downloadBidsAsCSV } from '../utils/spreadsheetExport';

// Download all bids for a tender
const handleDownloadCSV = () => {
  downloadBidsAsCSV(bids, currentTender);
};
```

### 2. Copying Bids to Clipboard

```tsx
import { copyBidsToClipboard } from '../utils/spreadsheetExport';

// Copy bids to clipboard (can be pasted into Excel)
const handleCopyToClipboard = async () => {
  await copyBidsToClipboard(bids);
  toast.success('Bids copied to clipboard');
};
```

### 3. Interactive Spreadsheet Component

```tsx
import { BidsSpreadsheetViewer } from './Tenders';

// Full view with all fields
<BidsSpreadsheetViewer bids={bids} view="full" />

// Simplified view with key fields only
<BidsSpreadsheetViewer bids={bids} view="simplified" />

// Transposed view (fields as rows, bidders as columns)
<BidsSpreadsheetViewer bids={bids} view="transposed" />
```

### 4. Exporting Tenders to CSV

```tsx
import { downloadTendersAsCSV } from '../utils/spreadsheetExport';

// Download all tenders
const handleDownloadTenders = () => {
  downloadTendersAsCSV(tenders);
};
```

## Field Configurations

### Bid Fields (Full Export)

The full bid export includes:

- **Vendor Information**: Name, Contact, Email, Phone, Address
- **Bid Details**: Title, Round, Submission Date
- **Product & Measurement**: Grade, UOM, Temperature, Density, Quality Spec
- **Pricing**: Currency, Price Type, Base Unit Price
- **Index-Linked Pricing**: Index Name, Location, Currency, Differential, Lag
- **Fees**: Into-Plane, Handling, Other fees
- **Commercial Terms**: Payment Terms, Credit Days
- **Inclusions**: Taxes, Airport Fees
- **Decision**: Status, Notes
- **AI Summary**

### Bid Fields (Simplified Export)

The simplified export includes only key fields:

- Vendor Name
- Product Grade
- Base Price
- Currency
- UOM
- Into-Plane Fee
- Handling Fee
- Payment Terms
- Credit Days
- Decision

### Tender Fields

Tender exports include:

- Basic Information (Title, Type, Description)
- Fuel Specifications (Type, Volume, Quality)
- Base Configuration (Currency, UOM)
- Benchmarking (Index, Location)
- Timeline (Submission, Delivery dates)
- Status and AI Summary

## Customization

### Adding Custom Fields

To add custom fields to exports, modify the field arrays in `spreadsheetExport.ts`:

```typescript
export const BID_EXPORT_FIELDS = [
  // ... existing fields
  { key: 'myCustomField', label: 'My Custom Field' },
] as const;
```

### Creating Custom Formatters

You can customize how values are formatted by modifying the `formatCellValue` function:

```typescript
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && value instanceof Date) {
    return value.toLocaleDateString();
  }
  // Add custom formatting logic here
  return String(value);
}
```

## API Reference

### Functions

#### `convertBidsToSpreadsheetData(bids: FuelBid[])`

Converts bids to react-spreadsheet format with all fields.

#### `convertBidsToSimplifiedSpreadsheetData(bids: FuelBid[])`

Converts bids to simplified spreadsheet format with key fields only.

#### `convertBidsToTransposedSpreadsheetData(bids: FuelBid[])`

Creates a transposed view where fields are rows and bidders are columns.

#### `convertBidsToCSV(bids: FuelBid[])`

Converts bids to CSV string with proper escaping.

#### `downloadBidsAsCSV(bids: FuelBid[], tender?: FuelTender | null, filename?: string)`

Downloads bids as a CSV file. Filename is auto-generated if not provided.

#### `copyBidsToClipboard(bids: FuelBid[])`

Copies bid data to clipboard in CSV format for pasting into Excel/Sheets.

#### `convertTendersToCSV(tenders: FuelTender[])`

Converts tenders to CSV string.

#### `downloadTendersAsCSV(tenders: FuelTender[], filename?: string)`

Downloads tenders as a CSV file.

## Examples

### Complete Download Button Implementation

```tsx
const handleDownloadCSV = () => {
  if (bids.length === 0) {
    toast.error('No bids to export');
    return;
  }
  try {
    downloadBidsAsCSV(bids, currentTender);
    toast.success('Bids exported successfully');
  } catch (error) {
    toast.error('Failed to export bids');
    console.error(error);
  }
};

<Button
  intent="secondary"
  text="Download CSV"
  icon={Download}
  onClick={handleDownloadCSV}
  disabled={bids.length === 0}
/>;
```

### Interactive Spreadsheet with Copy Feature

```tsx
<BaseCard
  title="Interactive Spreadsheet View"
  subtitle="Compare bids in a spreadsheet format - copy and paste to Excel"
  actions={
    <Button
      intent="secondary"
      text="Copy All"
      onClick={handleCopyToClipboard}
      disabled={bids.length === 0}
    />
  }
>
  <BidsSpreadsheetViewer bids={bids} view="simplified" />
</BaseCard>
```

## Browser Compatibility

- **CSV Download**: Works in all modern browsers
- **Clipboard Copy**: Requires HTTPS or localhost (browser security requirement)
- **Spreadsheet View**: Requires modern browser with CSS Grid support

## Future Enhancements

Potential improvements:

- [ ] Excel (.xlsx) export with formatting
- [ ] PDF export with styling
- [ ] Column filtering/selection UI
- [ ] Sort and filter in spreadsheet view
- [ ] Editable cells with sync back to database
- [ ] Custom column ordering
- [ ] Save/load export templates
