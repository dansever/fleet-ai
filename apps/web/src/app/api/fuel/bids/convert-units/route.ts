import 'server-only';

import { FuelBid, FuelTender } from '@/drizzle/types';
import {
  ConversionProgress,
  convertBidsInBatch,
  type ConvertedBid,
} from '@/services/fuel-bid-converter';
import { NextRequest, NextResponse } from 'next/server';

interface ConvertBidsRequest {
  bids: FuelBid[];
  tender: FuelTender;
}

interface ConvertBidsResponse {
  success: boolean;
  convertedBids?: ConvertedBid[];
  progress?: ConversionProgress;
  error?: string;
}

/**
 * POST /api/fuel/bids/convert-units
 *
 * Converts a batch of fuel bids to a tender's base currency and UOM
 * for normalized comparison.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ConvertBidsResponse>> {
  try {
    const { bids, tender }: ConvertBidsRequest = await req.json();

    // Validation
    if (!bids || !Array.isArray(bids) || bids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or empty bids array' },
        { status: 400 },
      );
    }

    if (!tender || !tender.baseCurrency || !tender.baseUom) {
      return NextResponse.json(
        { success: false, error: 'Invalid tender or missing base currency/UOM' },
        { status: 400 },
      );
    }

    console.log(
      `[Convert Units] Starting conversion for ${bids.length} bids → ${tender.baseCurrency}/${tender.baseUom}`,
    );

    // Convert bids using the service
    const { convertedBids, errors } = await convertBidsInBatch(bids, tender);

    console.log(
      `[Convert Units] Completed: ${convertedBids.length} bids processed, ${errors.length} errors`,
    );

    return NextResponse.json({
      success: true,
      convertedBids,
      progress: {
        total: bids.length,
        completed: convertedBids.length,
        current: convertedBids[convertedBids.length - 1]?.id || '',
        errors,
      },
    });
  } catch (error) {
    console.error('[Convert Units] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown conversion error',
      },
      { status: 500 },
    );
  }
}
