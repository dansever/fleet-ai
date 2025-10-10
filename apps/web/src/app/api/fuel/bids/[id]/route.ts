import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { server as fuelBidServer } from '@/modules/fuel/bids';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/fuel-bids/[id] - Get an existing fuel bid
 * @param _request
 * @param params
 * @returns
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get fuel bid by id
    const { id } = await params;
    const bid = await fuelBidServer.getFuelBidById(id);
    if (!bid) return jsonError('Fuel bid not found', 404);
    if (bid.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Return fuel bid
    return NextResponse.json(bid);
  } catch (error) {
    return jsonError('Failed to fetch fuel bid', 500);
  }
}

/**
 * PUT /api/fuel-bids/[id] - Update an existing fuel bid
 * @param request
 * @param params
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) {
      console.error('Auth error:', error);
      return jsonError('Unauthorized', 401);
    }

    // Get fuel bid by id
    const { id } = await params;
    console.log('Updating fuel bid:', id);

    const existing = await fuelBidServer.getFuelBidById(id);
    if (!existing) {
      console.error('Fuel bid not found:', id);
      return jsonError('Fuel bid not found', 404);
    }
    if (existing.orgId !== orgId) {
      console.error('Org mismatch:', { existingOrgId: existing.orgId, requestOrgId: orgId });
      return jsonError('Unauthorized', 401);
    }

    // Update fuel bid
    const body = await request.json();
    console.log('Update body:', body);

    // Convert date strings to Date objects if present
    const updateData = {
      ...body,
      orgId: orgId,
      decisionAt: body.decisionAt ? new Date(body.decisionAt) : undefined,
    };

    console.log('Processed update data:', updateData);

    const updated = await fuelBidServer.updateFuelBid(id, updateData);
    console.log('Fuel bid updated successfully:', updated.id);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating fuel bid:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    return jsonError('Failed to update fuel bid', 500);
  }
}

/**
 * DELETE /api/fuel-bids/[id] - Delete an existing fuel bid
 * @param _request
 * @param params
 * @returns
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get fuel bid by id
    const { id } = await params;
    const bid = await fuelBidServer.getFuelBidById(id);
    if (!bid) return jsonError('Fuel bid not found', 404);
    if (bid.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Delete fuel bid
    await fuelBidServer.deleteFuelBid(id);
    return NextResponse.json({ message: 'Fuel bid deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete fuel bid', 500);
  }
}
