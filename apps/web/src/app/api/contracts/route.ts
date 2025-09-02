import {
  createContract,
  deleteContract,
  getContract,
  getContractsByAirport,
  getContractsByAirportAndType,
  updateContract,
} from '@/db/contract-management/contracts/db-actions';
import { ContractType } from '@/drizzle/enums';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get fuel contracts
 * @param request - The request object
 * @returns The fuel contracts
 */
export async function GET(request: NextRequest) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');
    const airportId = searchParams.get('airportId');
    const contractType = searchParams.get('contractType');

    if (contractId) {
      const contract = await getContract(contractId);
      return NextResponse.json(contract);
    }

    if (contractType && airportId) {
      const contracts = await getContractsByAirportAndType(airportId, contractType as ContractType);
      return NextResponse.json(contracts);
    }

    if (airportId) {
      const contracts = await getContractsByAirport(airportId);
      return NextResponse.json(contracts);
    }

    return jsonError('Airport ID or contract ID is required', 400);
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
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const newContract = await createContract({
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
export async function PUT(request: NextRequest) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return jsonError('Contract ID is required', 400);
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const updatedContract = await updateContract(contractId, updateData);

    if (!updatedContract) {
      return jsonError('Contract not found', 404);
    }

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('Error updating fuel contract:', error);
    return jsonError('Internal server error', 500);
  }
}

/**
 * Delete a fuel contract
 * @param request - The request object
 * @returns The success message
 */
export async function DELETE(request: NextRequest) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return jsonError('Contract ID is required', 400);
    }

    await deleteContract(contractId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fuel contract:', error);
    return jsonError('Internal server error', 500);
  }
}
