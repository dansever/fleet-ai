import {
  createFuelContract,
  deleteFuelContract,
  getFuelContractById,
  getFuelContractsByAirportId,
  updateFuelContract,
} from '@/db/fuel-contracts/db-actions';
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
    const airportId = searchParams.get('airportId');
    const contractId = searchParams.get('id');

    if (airportId) {
      const contracts = await getFuelContractsByAirportId(airportId);
      return NextResponse.json(contracts);
    }

    if (contractId) {
      const contract = await getFuelContractById(contractId);
      return NextResponse.json(contract);
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
    const newFuelContract = await createFuelContract({
      ...body,
      orgId: dbUser.orgId,
    });

    if (!newFuelContract) {
      return jsonError('Failed to create fuel contract', 500);
    }

    return NextResponse.json(newFuelContract);
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

    const updatedContract = await updateFuelContract(contractId, updateData);

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

    await deleteFuelContract(contractId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fuel contract:', error);
    return jsonError('Internal server error', 500);
  }
}
