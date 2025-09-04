import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as fuelTenderServer } from '@/modules/fuel-mgmt/tenders';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const tender = await fuelTenderServer.getFuelTenderById(params.id);
    if (!tender) return jsonError('Fuel tender not found', 404);
    if (!authorizeResource(tender, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(tender);
  } catch (error) {
    return jsonError('Failed to fetch fuel tender', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await fuelTenderServer.getFuelTenderById(params.id);
    if (!existing) return jsonError('Fuel tender not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updated = await fuelTenderServer.updateFuelTender(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Failed to update fuel tender', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await fuelTenderServer.getFuelTenderById(params.id);
    if (!existing) return jsonError('Fuel tender not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    await fuelTenderServer.deleteFuelTender(params.id);
    return NextResponse.json({ message: 'Fuel tender deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete fuel tender', 500);
  }
}
