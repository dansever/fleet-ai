import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as fuelBidServer } from '@/modules/fuel-mgmt/bids';
import { server as fuelTenderServer } from '@/modules/fuel-mgmt/tenders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await authorizeUser();
    if (error || !dbUser || !orgId) {
      return jsonError('Unauthorized', 401);
    }

    // Get tender ID from query params
    const { searchParams } = new URL(request.url);
    const tenderId = searchParams.get('tenderId');

    // Check if tender ID is provided
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
 * POST /api/fuel-bids
 * Body: NewFuelBid
 * Returns: FuelBid
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

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

/**
 * PUT /api/fuel-bids
 * Body: UpdateFuelBid
 * Returns: FuelBid
 */
// PUT moved to /api/fuel-bids/[id]
export async function PUT(_request: NextRequest) {
  return jsonError('Use /api/fuel-bids/[id] for updates', 405);
}

/**
 * DELETE /api/fuel-bids
 * Body: FuelBid
 * Returns: void
 */
// DELETE moved to /api/fuel-bids/[id]
export async function DELETE(_request: NextRequest) {
  return jsonError('Use /api/fuel-bids/[id] for deletion', 405);
}
