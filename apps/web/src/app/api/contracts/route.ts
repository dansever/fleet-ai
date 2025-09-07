import { ContractType } from '@/drizzle/enums';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as contractServer } from '@/modules/contracts/contracts';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get fuel contracts
 * @param request - The request object
 * @returns The fuel contracts
 */
export async function GET(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const airportId = searchParams.get('airportId');
    const contractType = searchParams.get('contractType');

    if (contractType && airportId) {
      const contracts = await contractServer.listContractsByAirportAndType(
        airportId,
        contractType as ContractType,
      );
      return NextResponse.json(contracts);
    }

    if (airportId) {
      const contracts = await contractServer.listContractsByAirport(airportId);
      return NextResponse.json(contracts);
    }

    return jsonError('Airport ID is required', 400);
  } catch (error) {
    console.error('Error fetching fuel contracts:', error);
    return jsonError('Internal server error', 500);
  }
}

/**
 * Create a fuel contract
 * @param request - The request object
 * @returns The created fuel contract
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const newContract = await contractServer.createContract({
      ...body,
      orgId: dbUser.orgId,
    });

    if (!newContract) {
      return jsonError('Failed to create fuel contract', 500);
    }

    return NextResponse.json(newContract);
  } catch (error) {
    console.error('Error creating fuel contract:', error);
    return jsonError('Internal server error', 500);
  }
}

/**
 * Update a fuel contract
 * @param request - The request object
 * @returns The updated fuel contract
 */
// PUT/DELETE moved to /api/contracts/[id]
