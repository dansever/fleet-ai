import { UpdateAirport } from '@/drizzle/types';
import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as airportServer } from '@/modules/core/airports';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const airport = await airportServer.getAirportById(id);
    if (!airport) return jsonError('Airport not found', 404);
    if (!authorizeResource(airport, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(airport);
  } catch (error) {
    console.error('Error fetching airport by id:', error);
    return jsonError('Failed to fetch airport', 500);
  }
}

/**
 * Update an airport
 * @param request
 * @param param1
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const existing = await airportServer.getAirportById(id);
    if (!existing) return jsonError('Airport not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    const body: UpdateAirport = await request.json();
    const updated = await airportServer.updateAirport(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating airport:', error);
    return jsonError('Failed to update airport', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const existing = await airportServer.getAirportById(id);
    if (!existing) return jsonError('Airport not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    await airportServer.deleteAirport(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting airport:', error);
    return jsonError('Failed to delete airport', 500);
  }
}
