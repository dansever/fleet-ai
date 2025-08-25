import {
  createFuelBid,
  deleteFuelBid,
  getFuelBidsByTender,
  updateFuelBid,
} from '@/db/fuel-bids/db-actions';
import { getFuelTenderById } from '@/db/fuel-tenders/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { dbUser, error } = await authorizeUser();
  if (!dbUser || error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  const orgId = dbUser.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'User has no organization' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tenderId = searchParams.get('tenderId');

  if (!tenderId) {
    return NextResponse.json({ error: 'Tender ID is required' }, { status: 400 });
  }

  const fuelTender = await getFuelTenderById(tenderId);
  if (!fuelTender) {
    return NextResponse.json({ error: 'Fuel tender not found' }, { status: 404 });
  }

  // Authorize resource
  if (fuelTender.orgId !== orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fuelBids = await getFuelBidsByTender(tenderId);
  return NextResponse.json(fuelBids);
}

/**
 * POST /api/fuel-bids
 * Body: NewFuelBid
 * Returns: FuelBid
 */
export async function POST(request: NextRequest) {
  const { dbUser, error } = await authorizeUser();
  if (!dbUser || error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  const orgId = dbUser.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'User has no organization' }, { status: 403 });
  }

  // Get tender ID from query params
  const { searchParams } = new URL(request.url);
  const tenderId = searchParams.get('tenderId');
  if (!tenderId) {
    return NextResponse.json({ error: 'Tender ID is required' }, { status: 400 });
  }

  const body = await request.json();

  const fuelBid = await createFuelBid({ ...body, orgId, tenderId });
  return NextResponse.json(fuelBid);
}

/**
 * PUT /api/fuel-bids
 * Body: UpdateFuelBid
 * Returns: FuelBid
 */
export async function PUT(request: NextRequest) {
  const { dbUser, error } = await authorizeUser();
  if (!dbUser || error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  const orgId = dbUser.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'User has no organization' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Fuel bid ID is required' }, { status: 400 });
  }

  const body = await request.json();

  const fuelBid = await updateFuelBid(id, { ...body, orgId });
  return NextResponse.json(fuelBid);
}

/**
 * DELETE /api/fuel-bids
 * Body: FuelBid
 * Returns: void
 */
export async function DELETE(request: NextRequest) {
  const { dbUser, error } = await authorizeUser();
  if (!dbUser || error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  const orgId = dbUser.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'User has no organization' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Fuel bid ID is required' }, { status: 400 });
  }

  await deleteFuelBid(id);
  return NextResponse.json({ message: 'Fuel bid deleted' });
}
