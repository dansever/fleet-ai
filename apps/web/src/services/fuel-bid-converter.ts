import { runConversionAgent } from '@/agents/unit-converter/unitConverterAgent';
import { FuelBid, FuelTender } from '@/drizzle/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ConvertedBidField {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  conversionRate?: number;
  error?: string;
}

export interface FeeBasisMetadata {
  intoPlaneFee?: { basis: string | null; note: string };
  handlingFee?: { basis: string | null; note: string };
  otherFee?: { basis: string | null; note: string };
}

export interface ConvertedBid extends FuelBid {
  convertedBaseUnitPrice?: ConvertedBidField;
  convertedIntoPlaneFee?: ConvertedBidField;
  convertedHandlingFee?: ConvertedBidField;
  convertedOtherFee?: ConvertedBidField;
  convertedDifferential?: ConvertedBidField;
  normalizedTotalBeforeTax?: number;
  normalizedTotalWithTax?: number;
  feesBasis?: FeeBasisMetadata;
  pricingDisplay?: string;
  conversionStatus: 'pending' | 'converting' | 'completed' | 'error';
  conversionError?: string;
  lastConvertedAt?: Date;
}

export interface ConversionProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

// ============================================================================
// SIMPLE CONVERSION UTILITIES (No AI needed for basic math)
// ============================================================================

/**
 * Simple conversion rates - use these before resorting to AI
 * TODO: Expand this with more common conversions
 */
const SIMPLE_UOM_CONVERSIONS: Record<string, Record<string, number>> = {
  USG: { L: 3.78541, KG: 0.72 }, // Approximate for Jet-A
  L: { USG: 0.264172, KG: 0.8 },
  KG: { L: 1.25, USG: 1.38889 },
  LBS: { KG: 0.453592 },
};

/**
 * Try simple mathematical conversion first (faster than AI)
 */
function trySimpleConversion(value: number, fromUnit: string, toUnit: string): number | null {
  const normalizedFrom = fromUnit.toUpperCase().trim();
  const normalizedTo = toUnit.toUpperCase().trim();

  if (normalizedFrom === normalizedTo) return value;

  const rate = SIMPLE_UOM_CONVERSIONS[normalizedFrom]?.[normalizedTo];
  if (rate) return value * rate;

  return null; // Fall back to AI agent
}

// ============================================================================
// CONVERSION LOGIC
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

  return bidUnit.toUpperCase().trim() !== baseUnit.toUpperCase().trim();
}

/**
 * Convert a single value using either simple math or AI agent
 */
async function convertValue(
  value: number,
  fromUnit: string,
  toUnit: string,
): Promise<ConvertedBidField> {
  // Try simple conversion first
  const simpleResult = trySimpleConversion(value, fromUnit, toUnit);
  if (simpleResult !== null) {
    return {
      originalValue: value,
      originalUnit: fromUnit,
      convertedValue: simpleResult,
      convertedUnit: toUnit,
      conversionRate: simpleResult / value,
    };
  }

  // Fall back to AI agent for complex conversions
  try {
    const conversionRequest = `Convert ${value} ${fromUnit} to ${toUnit}`;
    const result = await runConversionAgent(conversionRequest);

    if (!result) {
      throw new Error('Agent returned no result');
    }

    return {
      originalValue: result.meta?.originalAmount || value,
      originalUnit: result.meta?.fromCurrency || result.meta?.fromUnit || fromUnit,
      convertedValue: result.value || 0,
      convertedUnit: result.unit || result.meta?.toCurrency || result.meta?.toUnit || toUnit,
      conversionRate: result.meta?.exchangeRate || result.meta?.precision,
    };
  } catch (error) {
    return {
      originalValue: value,
      originalUnit: fromUnit,
      convertedValue: 0,
      convertedUnit: toUnit,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
}

// ============================================================================
// BID CONVERSION
// ============================================================================

/**
 * Convert a single bid to the tender's base currency and UOM
 */
export async function convertBid(bid: FuelBid, tender: FuelTender): Promise<ConvertedBid> {
  const convertedBid: ConvertedBid = {
    ...bid,
    conversionStatus: 'converting',
    lastConvertedAt: new Date(),
  };

  const errors: string[] = [];

  try {
    const bidCurrency = bid.currency || 'USD';
    const tenderCurrency = tender.baseCurrency || 'USD';
    const bidUom = bid.uom || 'USG';
    const tenderUom = tender.baseUom || 'USG';

    // Convert base unit price (rate conversion: USD/USG → EUR/L)
    if (needsConversion(bid.baseUnitPrice, bidUom, tenderUom)) {
      const fromRate = `${bidCurrency}/${bidUom}`;
      const toRate = `${tenderCurrency}/${tenderUom}`;

      const converted = await convertValue(Number(bid.baseUnitPrice), fromRate, toRate);

      if (!converted.error) {
        convertedBid.convertedBaseUnitPrice = converted;
      } else {
        errors.push(`Base unit price: ${converted.error}`);
      }
    }

    // Convert currency-based fees
    const needsCurrencyConversion = bidCurrency.toUpperCase() !== tenderCurrency.toUpperCase();

    if (needsCurrencyConversion) {
      // Into plane fee
      if (bid.intoPlaneFee && Number(bid.intoPlaneFee) > 0) {
        const converted = await convertValue(Number(bid.intoPlaneFee), bidCurrency, tenderCurrency);
        if (!converted.error) {
          convertedBid.convertedIntoPlaneFee = converted;
        } else {
          errors.push(`Into plane fee: ${converted.error}`);
        }
      }

      // Handling fee
      if (bid.handlingFee && Number(bid.handlingFee) > 0) {
        const converted = await convertValue(Number(bid.handlingFee), bidCurrency, tenderCurrency);
        if (!converted.error) {
          convertedBid.convertedHandlingFee = converted;
        } else {
          errors.push(`Handling fee: ${converted.error}`);
        }
      }

      // Other fee
      if (bid.otherFee && Number(bid.otherFee) > 0) {
        const converted = await convertValue(Number(bid.otherFee), bidCurrency, tenderCurrency);
        if (!converted.error) {
          convertedBid.convertedOtherFee = converted;
        } else {
          errors.push(`Other fee: ${converted.error}`);
        }
      }
    }

    // Convert differential for index-based pricing
    if (
      bid.priceType === 'index_formula' &&
      needsConversion(bid.differentialValue, bid.differentialUnit, tenderUom)
    ) {
      const diffCurrency = bid.differentialCurrency || bidCurrency;
      const diffUom = bid.differentialUnit || bidUom;
      const fromRate = `${diffCurrency}/${diffUom}`;
      const toRate = `${tenderCurrency}/${tenderUom}`;

      const converted = await convertValue(Number(bid.differentialValue), fromRate, toRate);

      if (!converted.error) {
        convertedBid.convertedDifferential = converted;
      } else {
        errors.push(`Differential: ${converted.error}`);
      }
    }

    // Add metadata
    convertedBid.feesBasis = createFeeBasisMetadata(bid);
    convertedBid.pricingDisplay = createPricingDisplay(bid);

    // Calculate totals
    const totalBeforeTax = calculateNormalizedTotal(convertedBid);
    convertedBid.normalizedTotalBeforeTax = totalBeforeTax;
    convertedBid.normalizedTotalWithTax = calculateNormalizedTotalWithTax(
      convertedBid,
      totalBeforeTax,
    );

    convertedBid.conversionStatus = 'completed';
  } catch (error) {
    convertedBid.conversionStatus = 'error';
    convertedBid.conversionError =
      error instanceof Error ? error.message : 'Unknown conversion error';
    errors.push(convertedBid.conversionError);
  }

  if (errors.length > 0) {
    convertedBid.conversionError = errors.join('; ');
  }

  return convertedBid;
}

/**
 * Convert multiple bids in parallel
 */
export async function convertBidsInBatch(
  bids: FuelBid[],
  tender: FuelTender,
  onProgress?: (progress: ConversionProgress) => void,
): Promise<{ convertedBids: ConvertedBid[]; errors: string[] }> {
  const errors: string[] = [];
  let completed = 0;

  // Process bids in parallel with a concurrency limit
  const CONCURRENCY = 3; // Process 3 bids at a time
  const results: ConvertedBid[] = [];

  for (let i = 0; i < bids.length; i += CONCURRENCY) {
    const batch = bids.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map((bid) => convertBid(bid, tender)));

    results.push(...batchResults);
    completed += batch.length;

    // Report progress
    if (onProgress) {
      onProgress({
        total: bids.length,
        completed,
        current: batchResults[batchResults.length - 1].id,
        errors,
      });
    }

    // Collect errors
    batchResults.forEach((bid) => {
      if (bid.conversionError) {
        errors.push(`Bid ${bid.id}: ${bid.conversionError}`);
      }
    });
  }

  return { convertedBids: results, errors };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createFeeBasisMetadata(bid: FuelBid): FeeBasisMetadata {
  const metadata: FeeBasisMetadata = {};

  const createNote = (basis: string | null) => {
    if (!basis) return '';
    if (basis === 'per_uplift') return '(per uplift)';
    if (basis === 'per_delivery') return '(per delivery)';
    if (basis === 'per_uom') return '';
    return `(${basis})`;
  };

  if (bid.intoPlaneFeeUnit) {
    metadata.intoPlaneFee = {
      basis: bid.intoPlaneFeeUnit,
      note: createNote(bid.intoPlaneFeeUnit),
    };
  }

  if (bid.handlingFeeBasis) {
    metadata.handlingFee = {
      basis: bid.handlingFeeBasis,
      note: createNote(bid.handlingFeeBasis),
    };
  }

  if (bid.otherFeeBasis) {
    metadata.otherFee = {
      basis: bid.otherFeeBasis,
      note: createNote(bid.otherFeeBasis),
    };
  }

  return metadata;
}

function createPricingDisplay(bid: FuelBid): string {
  if (bid.priceType === 'index_formula') {
    const indexName = bid.indexName || 'Index';
    const location = bid.indexLocation ? ` ${bid.indexLocation}` : '';
    return `Index: ${indexName}${location}`;
  }
  return 'Fixed';
}

function calculateNormalizedTotal(convertedBid: ConvertedBid): number {
  let total = 0;

  // Base unit price
  if (convertedBid.convertedBaseUnitPrice && !convertedBid.convertedBaseUnitPrice.error) {
    total += convertedBid.convertedBaseUnitPrice.convertedValue;
  } else if (convertedBid.baseUnitPrice) {
    total += Number(convertedBid.baseUnitPrice);
  }

  // Differential (index pricing)
  if (convertedBid.priceType === 'index_formula') {
    if (convertedBid.convertedDifferential && !convertedBid.convertedDifferential.error) {
      total += convertedBid.convertedDifferential.convertedValue;
    } else if (convertedBid.differentialValue) {
      total += Number(convertedBid.differentialValue);
    }
  }

  // Fees (only if per_uom basis)
  const addFeeIfPerUom = (
    converted: ConvertedBidField | undefined,
    original: string | number | null | undefined,
    basis: string | null | undefined,
  ) => {
    if (basis === 'per_uom' || !basis) {
      if (converted && !converted.error) {
        total += converted.convertedValue;
      } else if (original) {
        total += Number(original);
      }
    }
  };

  addFeeIfPerUom(
    convertedBid.convertedIntoPlaneFee,
    convertedBid.intoPlaneFee,
    convertedBid.intoPlaneFeeUnit,
  );
  addFeeIfPerUom(
    convertedBid.convertedHandlingFee,
    convertedBid.handlingFee,
    convertedBid.handlingFeeBasis,
  );
  addFeeIfPerUom(convertedBid.convertedOtherFee, convertedBid.otherFee, convertedBid.otherFeeBasis);

  return total;
}

function calculateNormalizedTotalWithTax(
  convertedBid: ConvertedBid,
  totalBeforeTax: number,
): number {
  if (convertedBid.includesTaxes) {
    return totalBeforeTax;
  }
  // Estimate 10% tax if not included
  return totalBeforeTax * 1.1;
}
