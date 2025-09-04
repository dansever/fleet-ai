import { UpdateAirport } from '@/drizzle/types';
import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as airportServer } from '@/modules/core/airports';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const airport = await airportServer.getAirportById(params.id);
    if (!airport) return jsonError('Airport not found', 404);
    if (!authorizeResource(airport, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(airport);
  } catch (error) {
    console.error('Error fetching airport by id:', error);
    return jsonError('Failed to fetch airport', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await airportServer.getAirportById(params.id);
    if (!existing) return jsonError('Airport not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    const body: UpdateAirport = await request.json();
    const updated = await airportServer.updateAirport(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating airport:', error);
    return jsonError('Failed to update airport', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await airportServer.getAirportById(params.id);
    if (!existing) return jsonError('Airport not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    await airportServer.deleteAirport(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting airport:', error);
    return jsonError('Failed to delete airport', 500);
  }
}
