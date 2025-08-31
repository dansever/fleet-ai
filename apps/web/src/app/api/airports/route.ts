import {
  createAirport,
  deleteAirport,
  getAirportById,
  getAirportsByOrgId,
  updateAirport,
} from '@/db/core/airports/db-actions';
import { NewAirport, UpdateAirport } from '@/drizzle/types';
import { loadAirportDataset } from '@/features/airports/airportDatasetService';
import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/airports
 * Query parameters:
 * - id: string (get specific airport)
 * - orgId: string (get airports by organization - defaults to current user's org)
 * - dataset: boolean (get airport dataset for autocomplete/search)
 * - q: string (search query for dataset)
 * - limit: number (limit results for dataset, default 50)
 */
export async function GET(request: NextRequest) {
  try {
    // Get query params first to check for dataset request
    const { searchParams } = new URL(request.url);
    const isDatasetRequest = searchParams.get('dataset') === 'true';

    // Handle dataset requests (public airport data for autocomplete)
    if (isDatasetRequest) {
      const query = searchParams.get('q')?.toLowerCase() || '';
      const limit = parseInt(searchParams.get('limit') || '50');

      const airports = await loadAirportDataset();

      if (!query) {
        return NextResponse.json(airports.slice(0, limit));
      }

      // Filter airports based on search query
      const filtered = airports
        .filter(
          (airport) =>
            airport.airport.toLowerCase().includes(query) ||
            airport.iata.toLowerCase().includes(query) ||
            airport.icao.toLowerCase().includes(query) ||
            airport.region_name.toLowerCase().includes(query) ||
            airport.country_code.toLowerCase().includes(query),
        )
        .slice(0, limit);

      return NextResponse.json(filtered);
    }

    // For non-dataset requests, require authorization
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const userOrgId = dbUser.orgId;
    if (!userOrgId) return jsonError('User has no organization', 403);

    const id = searchParams.get('id');
    const requestedOrgId = searchParams.get('orgId') || userOrgId;

    // User can only access airports from their own organization
    if (requestedOrgId !== userOrgId) return jsonError('Unauthorized', 401);

    // Get specific airport by ID
    if (id) {
      const airport = await getAirportById(id);
      if (!airport) return jsonError('Airport not found', 404);

      // Authorize access
      if (!authorizeResource(airport, dbUser)) return jsonError('Unauthorized', 401);

      // Return the airport
      return NextResponse.json(airport);
    }

    // Default: Get all airports for organization
    const airports = await getAirportsByOrgId(userOrgId);
    return NextResponse.json(airports);
  } catch (error) {
    console.error('Error fetching airports:', error);
    return jsonError('Failed to fetch airports', 500);
  }
}

/**
 * POST /api/airports
 * Create a new airport
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { error, dbUser } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get the organization ID
    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('Organization not found', 404);

    // Create the airport
    const body: NewAirport = await request.json();
    const newAirport = await createAirport({ ...body, orgId });
    return NextResponse.json(newAirport);
  } catch (error) {
    console.error('Error creating airport:', error);
    return jsonError('Internal server error', 500);
  }
}

/**
 * PUT /api/airports
 * Update an airport by ID (passed as query parameter)
 */
export async function PUT(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const userOrgId = dbUser.orgId;
    if (!userOrgId) return jsonError('User has no organization', 403);

    // Get airport ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Airport ID is required', 400);

    // Load airport from DB
    const airport = await getAirportById(id);
    if (!airport) return jsonError('Airport not found', 404);

    // Authorize access
    if (!authorizeResource(airport, dbUser)) return jsonError('Unauthorized', 401);

    // Update the airport
    const body: UpdateAirport = await request.json();
    const updatedAirport = await updateAirport(id, body);
    return NextResponse.json(updatedAirport);
  } catch (error) {
    console.error('Error updating airport:', error);
    return jsonError('Failed to update airport', 500);
  }
}

/**
 * DELETE /api/airports
 * Delete an airport by ID (passed as query parameter)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const userOrgId = dbUser.orgId;
    if (!userOrgId) return jsonError('User has no organization', 403);

    // Get airport ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Airport ID is required', 400);

    // Load airport from DB
    const airport = await getAirportById(id);
    if (!airport) return jsonError('Airport not found', 404);

    // Authorize access
    if (!authorizeResource(airport, dbUser)) return jsonError('Unauthorized', 401);

    // Delete the airport
    await deleteAirport(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting airport:', error);
    return jsonError('Failed to delete airport', 500);
  }
}
