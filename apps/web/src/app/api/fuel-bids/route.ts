import {
  createFuelBid,
  deleteFuelBid,
  getFuelBidsByTender,
  updateFuelBid,
} from '@/db/fuel-bids/db-actions';
import { getFuelTenderById } from '@/db/fuel-tenders/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get organization ID
    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get tender ID from query params
    const { searchParams } = new URL(request.url);
    const tenderId = searchParams.get('tenderId');

    // Check if tender ID is provided
    if (!tenderId) return jsonError('Tender ID is required', 400);

    // Get fuel tender by ID
    const fuelTender = await getFuelTenderById(tenderId);
    if (!fuelTender) return jsonError('Fuel tender not found', 404);

    // Check if user has access to tender
    if (fuelTender.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Get fuel bids by tender ID
    const fuelBids = await getFuelBidsByTender(tenderId);
    return NextResponse.json(fuelBids);
  } catch (error) {
    console.error('Error getting fuel bids:', error);
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

    const fuelBid = await createFuelBid({ ...body, orgId, tenderId });
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
export async function PUT(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get organization ID
    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get fuel bid ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Fuel bid ID is required', 400);

    // Get body
    const body = await request.json();

    // Update fuel bid
    const fuelBid = await updateFuelBid(id, { ...body, orgId });

    // Return fuel bid
    return NextResponse.json(fuelBid);
  } catch (error) {
    console.error('Error updating fuel bid:', error);
    return jsonError('Failed to update fuel bid', 500);
  }
}

/**
 * DELETE /api/fuel-bids
 * Body: FuelBid
 * Returns: void
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get organization ID
    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get fuel bid ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Fuel bid ID is required', 400);

    // Delete fuel bid
    await deleteFuelBid(id);
    return NextResponse.json({ message: 'Fuel bid deleted successfully' });
  } catch (error) {
    console.error('Error deleting fuel bid:', error);
    return jsonError('Failed to delete fuel bid', 500);
  }
}
