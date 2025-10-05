import 'server-only';

import { runConversionAgent } from '@/agents/unit-converter/unitConverterAgent';
import { FuelBid, FuelTender } from '@/drizzle/types';
import { NextRequest, NextResponse } from 'next/server';

// Types for the conversion request
interface ConversionRequest {
  value: number;
  fromUnit: string;
  toUnit: string;
  isCurrency?: boolean;
}

interface ConvertedBidField {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  conversionRate?: number;
  error?: string;
}

interface ConvertedBid extends FuelBid {
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

interface ConversionProgress {
  total: number;
  completed: number;
  current: string; // bid ID being processed
  errors: string[];
}

interface ConvertBidsRequest {
  bids: FuelBid[];
  tender: FuelTender;
}

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
 * Creates conversion request text for the AI agent
 */
function createConversionRequest(
  value: number,
  fromUnit: string,
  toUnit: string,
  isCurrency: boolean = false,
): string {
  if (isCurrency) {
    return `Convert ${value} ${fromUnit} to ${toUnit}`;
  }
  return `Convert ${value} ${fromUnit} to ${toUnit}`;
}

/**
 * Calls the unit converter agent for conversion
 */
async function convertValue(conversionRequest: string): Promise<string> {
  try {
    const result = await runConversionAgent(conversionRequest);
    if (!result) {
      return '{}';
    }
    return JSON.stringify(result);
  } catch (error) {
    console.error('Conversion agent failed:', error);
    return JSON.stringify({
      error: 'AGENT_ERROR',
      message: error instanceof Error ? error.message : 'Unknown conversion error',
    });
  }
}

/**
 * Parses conversion result from AI agent
 */
function parseConversionResult(result: string): ConvertedBidField | null {
  try {
    const parsed = JSON.parse(result);

    // Handle error responses
    if (parsed.error) {
      return {
        originalValue: 0,
        originalUnit: '',
        convertedValue: 0,
        convertedUnit: '',
        error: parsed.message || 'Conversion failed',
      };
    }

    return {
      originalValue: parsed.meta?.originalAmount || parsed.value || 0,
      originalUnit: parsed.meta?.fromCurrency || parsed.meta?.fromUnit || '',
      convertedValue: parsed.value || 0,
      convertedUnit: parsed.unit || parsed.meta?.toCurrency || parsed.meta?.toUnit || '',
      conversionRate: parsed.meta?.exchangeRate || parsed.meta?.precision,
    };
  } catch (error) {
    console.error('Failed to parse conversion result:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bids, tender }: ConvertBidsRequest = await req.json();

    if (!bids || !tender) {
      return NextResponse.json({ error: 'Missing bids or tender data' }, { status: 400 });
    }

    console.log(
      `Starting conversion for ${bids.length} bids to base currency: ${tender.baseCurrency}, base UOM: ${tender.baseUom}`,
    );

    const convertedBids: ConvertedBid[] = [];
    const errors: string[] = [];
    let completed = 0;

    // Initialize progress tracking
    const progress: ConversionProgress = {
      total: bids.length,
      completed: 0,
      current: '',
      errors: [],
    };

    for (const bid of bids) {
      progress.current = bid.id;

      const convertedBid: ConvertedBid = {
        ...bid,
        conversionStatus: 'converting',
        lastConvertedAt: new Date(),
      };

      try {
        // Convert base unit price (UOM conversion)
        if (needsConversion(bid.baseUnitPrice, bid.uom, tender.baseUom)) {
          const conversionRequest = createConversionRequest(
            Number(bid.baseUnitPrice),
            bid.uom || 'USG',
            tender.baseUom || 'USG',
            false, // UOM conversion
          );

          const result = await convertValue(conversionRequest);
          const converted = parseConversionResult(result);

          if (converted && !converted.error) {
            convertedBid.convertedBaseUnitPrice = converted;
          } else {
            errors.push(
              `Failed to convert base unit price for bid ${bid.id}: ${converted?.error || 'Unknown error'}`,
            );
          }
        }

        // Convert currency-based fields if needed
        const needsCurrencyConversion =
          bid.currency &&
          tender.baseCurrency &&
          bid.currency.toUpperCase() !== tender.baseCurrency.toUpperCase();

        if (needsCurrencyConversion) {
          // Convert into plane fee (currency conversion)
          if (bid.intoPlaneFee && Number(bid.intoPlaneFee) > 0) {
            const conversionRequest = createConversionRequest(
              Number(bid.intoPlaneFee),
              bid.currency || 'USD',
              tender.baseCurrency || 'USD',
              true, // Currency conversion
            );

            const result = await convertValue(conversionRequest);
            const converted = parseConversionResult(result);

            if (converted && !converted.error) {
              convertedBid.convertedIntoPlaneFee = converted;
            } else {
              errors.push(
                `Failed to convert into plane fee for bid ${bid.id}: ${converted?.error || 'Unknown error'}`,
              );
            }
          }

          // Convert handling fee (currency conversion)
          if (bid.handlingFee && Number(bid.handlingFee) > 0) {
            const conversionRequest = createConversionRequest(
              Number(bid.handlingFee),
              bid.currency || 'USD',
              tender.baseCurrency || 'USD',
              true, // Currency conversion
            );

            const result = await convertValue(conversionRequest);
            const converted = parseConversionResult(result);

            if (converted && !converted.error) {
              convertedBid.convertedHandlingFee = converted;
            } else {
              errors.push(
                `Failed to convert handling fee for bid ${bid.id}: ${converted?.error || 'Unknown error'}`,
              );
            }
          }

          // Convert other fee (currency conversion)
          if (bid.otherFee && Number(bid.otherFee) > 0) {
            const conversionRequest = createConversionRequest(
              Number(bid.otherFee),
              bid.currency || 'USD',
              tender.baseCurrency || 'USD',
              true, // Currency conversion
            );

            const result = await convertValue(conversionRequest);
            const converted = parseConversionResult(result);

            if (converted && !converted.error) {
              convertedBid.convertedOtherFee = converted;
            } else {
              errors.push(
                `Failed to convert other fee for bid ${bid.id}: ${converted?.error || 'Unknown error'}`,
              );
            }
          }
        }

        // Convert differential for index-based pricing (UOM conversion)
        if (
          bid.priceType === 'index_formula' &&
          needsConversion(bid.differentialValue, bid.differentialUnit, tender.baseUom)
        ) {
          const conversionRequest = createConversionRequest(
            Number(bid.differentialValue),
            bid.differentialUnit || bid.uom || 'USG',
            tender.baseUom || 'USG',
            false, // UOM conversion
          );

          const result = await convertValue(conversionRequest);
          const converted = parseConversionResult(result);

          if (converted && !converted.error) {
            convertedBid.convertedDifferential = converted;
          } else {
            errors.push(
              `Failed to convert differential for bid ${bid.id}: ${converted?.error || 'Unknown error'}`,
            );
          }
        }

        convertedBid.conversionStatus = 'completed';
      } catch (error) {
        console.error(`Error converting bid ${bid.id}:`, error);
        convertedBid.conversionStatus = 'error';
        convertedBid.conversionError =
          error instanceof Error ? error.message : 'Unknown conversion error';
        errors.push(`Conversion error for bid ${bid.id}: ${convertedBid.conversionError}`);
      }

      convertedBids.push(convertedBid);
      completed++;
      progress.completed = completed;
      progress.errors = errors;
    }

    console.log(
      `Conversion completed: ${completed}/${bids.length} bids processed, ${errors.length} errors`,
    );

    return NextResponse.json({
      success: true,
      convertedBids,
      progress,
    });
  } catch (error) {
    console.error('Bid conversion API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

