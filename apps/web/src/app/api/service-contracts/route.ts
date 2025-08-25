import { getOrgById } from '@/db/orgs/db-actions';
import { getServiceContractsByAirport } from '@/db/service-contracts/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/service-contracts
 * Query parameters:
 * - id: string (get specific org by DB ID)
 * - airportId: string (get service contracts by airport)
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const userOrgId = dbUser.orgId;
    if (!userOrgId) return jsonError('User has no organization', 403);

    // Get query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const airportId = searchParams.get('airportId');

    if (!id || !airportId) return jsonError('No parameters found - ID or AirportID');

    // Get specific org by DB ID
    if (id) {
      // User can only access their own organization
      if (id !== userOrgId) return jsonError('Unauthorized', 401);

      const org = await getOrgById(id);
      if (!org) return jsonError('Organization not found', 404);

      return NextResponse.json(org);
    }

    // Get service contracts by airport
    if (airportId) {
      const contracts = await getServiceContractsByAirport(airportId);
      return NextResponse.json(contracts);
    }
  } catch (error) {
    console.error('Error fetching organization:', error);
    return jsonError('Failed to fetch organization', 500);
  }
}

// TODO: Add PUT, POST, DELETE
