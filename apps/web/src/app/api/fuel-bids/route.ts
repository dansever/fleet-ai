import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as fuelBidServer } from '@/modules/fuel/bids';
import { server as fuelTenderServer } from '@/modules/fuel/tenders';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/fuel-bids - Get all fuel bids
 * @param request
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) {
      return jsonError('Unauthorized', 401);
    }

    // Get tender ID from query params
    const { searchParams } = new URL(request.url);
    const tenderId = searchParams.get('tenderId');
    if (!tenderId) {
      return jsonError('Tender ID is required', 400);
    }

    const fuelTender = await fuelTenderServer.getFuelTender(tenderId);
    if (!fuelTender) {
      return jsonError('Fuel tender not found', 404);
    }

    // Get fuel bids by tender ID
    const fuelBids = await fuelBidServer.listFuelBidsByTender(tenderId);

    return NextResponse.json(fuelBids);
  } catch (error) {
    console.error('API: GET /api/fuel-bids - Error:', error);
    return jsonError('Failed to get fuel bids', 500);
  }
}

/**
 * POST /api/fuel-bids - Create a new fuel bid
 * Body: NewFuelBid
 * Returns: FuelBid
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get tender ID from query params
    const { searchParams } = new URL(request.url);
    const tenderId = searchParams.get('tenderId');
    if (!tenderId) return jsonError('Tender ID is required', 400);

    const body = await request.json();

    const fuelBid = await fuelBidServer.createFuelBid({ ...body, orgId, tenderId });
    return NextResponse.json(fuelBid, { status: 201 });
  } catch (error) {
    console.error('Error creating fuel bid:', error);
    return jsonError('Failed to create fuel bid', 500);
  }
}
