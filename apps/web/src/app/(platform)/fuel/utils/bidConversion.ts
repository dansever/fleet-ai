import { FuelBid, FuelTender } from '@/drizzle/types';
import { CACHE_TTL, cacheManager, createCacheKey } from './cacheManager';

// ============================================================================
// Types
// ============================================================================

export interface BidForConversion {
  id: FuelBid['id'];
  vendorName: FuelBid['vendorName'];
  // Money fields
  baseUnitPrice: FuelBid['baseUnitPrice'];
  intoPlaneFee: FuelBid['intoPlaneFee'];
  handlingFee: FuelBid['handlingFee'];
  otherFee: FuelBid['otherFee'];
  currency: FuelBid['currency'];
  // UOM fields
  uom: FuelBid['uom'];
  // Index fields
  differentialValue: FuelBid['differentialValue'];
  differentialUnit: FuelBid['differentialUnit'];
  differentialCurrency: FuelBid['differentialCurrency'];
}

export interface ConvertedBidField {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  conversionRate?: number;
  error?: string;
}

export interface ConvertedBid extends FuelBid {
  // Converted pricing fields
  convertedBaseUnitPrice?: ConvertedBidField;
  convertedIntoPlaneFee?: ConvertedBidField;
  convertedHandlingFee?: ConvertedBidField;
  convertedOtherFee?: ConvertedBidField;
  convertedDifferential?: ConvertedBidField;

  // Conversion metadata
  conversionStatus: 'pending' | 'converting' | 'completed' | 'error';
  conversionError?: string;
  lastConvertedAt?: Date;
}

export interface ConversionProgress {
  total: number;
  completed: number;
  current: string; // bid ID being processed
  errors: string[];
}

// ============================================================================
// Cache Configuration
// ============================================================================

const CACHE_KEYS_CONVERSION = {
  CONVERTED_BIDS: 'converted-bids',
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Determines if a bid field needs conversion
 */
function needsConversion(
  value: string | number | null | undefined,
  bidUnit: string | null | undefined,
  baseUnit: string | null | undefined,
): boolean {
  if (!value || !bidUnit || !baseUnit) return false;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue) || numValue === 0) return false;

  // Normalize units for comparison
  const normalizedBidUnit = bidUnit.toUpperCase().trim();
  const normalizedBaseUnit = baseUnit.toUpperCase().trim();

  return normalizedBidUnit !== normalizedBaseUnit;
}

/**
 * Calls the conversion API endpoint
 */
async function convertBidsViaAPI(bids: FuelBid[], tender: FuelTender): Promise<ConvertedBid[]> {
  try {
    const response = await fetch('/api/fuel/convert-bids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bids, tender }),
    });

    if (!response.ok) {
      throw new Error(`Conversion API failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Conversion failed');
    }

    return result.convertedBids;
  } catch (error) {
    console.error('Conversion API failed:', error);
    throw error;
  }
}

// ============================================================================
// Main Conversion Function
// ============================================================================

/**
 * Converts bid fields to tender's base currency and UOM
 * Uses API endpoint for conversions and caches results to avoid repeated API calls
 */
export async function convertBidsToTenderBase(
  bids: FuelBid[],
  tender: FuelTender,
  onProgress?: (progress: ConversionProgress) => void,
): Promise<ConvertedBid[]> {
  const cacheKey = createCacheKey(CACHE_KEYS_CONVERSION.CONVERTED_BIDS, tender.id);

  // Check cache first
  const cachedConvertedBids = cacheManager.get<ConvertedBid[]>(cacheKey, CACHE_TTL.CONVERSIONS);
  if (cachedConvertedBids && cachedConvertedBids.length === bids.length) {
    console.log('Using cached converted bids for tender:', tender.id);
    return cachedConvertedBids;
  }

  console.log(
    `Starting conversion for ${bids.length} bids to base currency: ${tender.baseCurrency}, base UOM: ${tender.baseUom}`,
  );

  try {
    // Call the API endpoint for conversion
    const convertedBids = await convertBidsViaAPI(bids, tender);

    // Cache the results
    cacheManager.set(cacheKey, convertedBids, CACHE_TTL.CONVERSIONS);

    console.log(`Conversion completed: ${convertedBids.length} bids processed`);

    return convertedBids;
  } catch (error) {
    console.error('Bid conversion failed:', error);

    // Return bids with error status
    return bids.map((bid) => ({
      ...bid,
      conversionStatus: 'error' as const,
      conversionError: error instanceof Error ? error.message : 'Unknown conversion error',
      lastConvertedAt: new Date(),
    }));
  }
}

/**
 * Gets converted bid data from cache if available
 */
export function getCachedConvertedBids(tenderId: string): ConvertedBid[] | null {
  const cacheKey = createCacheKey(CACHE_KEYS_CONVERSION.CONVERTED_BIDS, tenderId);
  return cacheManager.get<ConvertedBid[]>(cacheKey, CACHE_TTL.CONVERSIONS);
}

/**
 * Clears converted bid cache for a specific tender
 */
export function clearConvertedBidsCache(tenderId: string): void {
  const cacheKey = createCacheKey(CACHE_KEYS_CONVERSION.CONVERTED_BIDS, tenderId);
  cacheManager.delete(cacheKey);
}

/**
 * Gets display value for a bid field (converted if available, otherwise original)
 */
export function getDisplayValue(
  bid: ConvertedBid,
  field: 'baseUnitPrice' | 'intoPlaneFee' | 'handlingFee' | 'otherFee' | 'differentialValue',
): { value: number; unit: string; isConverted: boolean } {
  const convertedField =
    `converted${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof ConvertedBid;
  const converted = bid[convertedField] as ConvertedBidField | undefined;

  if (converted && !converted.error) {
    return {
      value: converted.convertedValue,
      unit: converted.convertedUnit,
      isConverted: true,
    };
  }

  // Fallback to original values
  const originalValue = bid[field];
  const unit =
    field === 'baseUnitPrice'
      ? bid.uom || 'USD'
      : field === 'differentialValue'
        ? bid.differentialUnit || bid.uom || 'USD'
        : `${bid.currency || 'USD'}/${bid.uom || 'USG'}`;

  return {
    value: Number(originalValue) || 0,
    unit,
    isConverted: false,
  };
}
