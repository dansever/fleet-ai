import { NewAirport } from '@/drizzle/types';
import { loadAirportDataset } from '@/features/airports/airportDatasetService';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as airportServer } from '@/modules/core/airports';
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
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const requestedOrgId = searchParams.get('orgId') || orgId;

    // User can only access airports from their own organization
    if (requestedOrgId !== orgId) return jsonError('Unauthorized', 401);

    // Default: Get all airports for organization
    const airports = await airportServer.listAirportsByOrgId(orgId);
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
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get body & create airport
    const body: NewAirport = await request.json();
    const newAirport = await airportServer.createAirport({ ...body, orgId });
    return NextResponse.json(newAirport);
  } catch (error) {
    console.error('Error creating airport:', error);
    return jsonError('Internal server error', 500);
  }
}
