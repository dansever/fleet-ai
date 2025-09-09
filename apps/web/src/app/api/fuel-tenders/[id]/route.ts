import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as fuelTenderServer } from '@/modules/fuel/tenders';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get fuel tender by id
    const { id } = await params;
    const tender = await fuelTenderServer.getFuelTenderById(id);
    if (!tender) return jsonError('Fuel tender not found', 404);
    if (tender.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Authorize resource
    if (!authorizeResource(tender, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(tender);
  } catch (error) {
    return jsonError('Failed to fetch fuel tender', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get fuel tender by id
    const { id } = await params;
    const existing = await fuelTenderServer.getFuelTenderById(id);
    if (!existing) return jsonError('Fuel tender not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Authorize resource
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updated = await fuelTenderServer.updateFuelTender(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Failed to update fuel tender', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get fuel tender by id
    const { id } = await params;
    const existing = await fuelTenderServer.getFuelTenderById(id);
    if (!existing) return jsonError('Fuel tender not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Authorize resource
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    // Delete fuel tender
    await fuelTenderServer.deleteFuelTender(id);
    return NextResponse.json({ message: 'Fuel tender deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete fuel tender', 500);
  }
}
