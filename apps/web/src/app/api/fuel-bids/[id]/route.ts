import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as fuelBidServer } from '@/modules/fuel-mgmt/bids';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const bid = await fuelBidServer.getFuelBidById(params.id);
    if (!bid) return jsonError('Fuel bid not found', 404);
    if (bid.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    return NextResponse.json(bid);
  } catch (error) {
    return jsonError('Failed to fetch fuel bid', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await fuelBidServer.getFuelBidById(params.id);
    if (!existing) return jsonError('Fuel bid not found', 404);
    if (existing.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updated = await fuelBidServer.updateFuelBid(params.id, { ...body, orgId: dbUser.orgId });
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Failed to update fuel bid', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const bid = await fuelBidServer.getFuelBidById(params.id);
    if (!bid) return jsonError('Fuel bid not found', 404);
    if (bid.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    await fuelBidServer.deleteFuelBid(params.id);
    return NextResponse.json({ message: 'Fuel bid deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete fuel bid', 500);
  }
}
