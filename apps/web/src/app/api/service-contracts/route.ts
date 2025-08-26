import {
  createServiceContract,
  getServiceContract,
  getServiceContractsByAirport,
} from '@/db/service-contracts/db-actions';
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

    if (!id && !airportId) return jsonError('No parameters found - ID or AirportID required');

    // Get service contract by ID
    if (id) {
      const contract = await getServiceContract(id);
      return NextResponse.json(contract);
    }

    // Get service contracts by airport
    if (airportId) {
      const contracts = await getServiceContractsByAirport(airportId);
      return NextResponse.json(contracts);
    }
  } catch (error) {
    console.error('Error fetching service contracts:', error);
    return jsonError('Failed to fetch service contracts', 500);
  }
}

// TODO: Add PUT, POST, DELETE

export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get orgId
    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get query params
    const { searchParams } = new URL(request.url);
    const airportId = searchParams.get('airportId');

    // Get body
    const body = await request.json();
    const contract = await createServiceContract({ ...body, airportId, orgId });

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error creating service contract:', error);
    return jsonError('Failed to create service contract', 500);
  }
}
