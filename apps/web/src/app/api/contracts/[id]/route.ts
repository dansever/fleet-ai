import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { server as contractsServer } from '@/modules/contracts';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Get a contract by ID
 * @param _request
 * @param params
 * @returns
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await authenticateUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const contract = await contractsServer.getContractById(id);
    if (!contract) return jsonError('Contract not found', 404);
    if (contract.orgId !== orgId) return jsonError('Unauthorized', 401);

    return NextResponse.json(contract);
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}

/**
 * Update a contract
 * @param request
 * @param params
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await authenticateUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const existing = await contractsServer.getContractById(id);
    if (!existing) return jsonError('Contract not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updateData = { ...body, updatedAt: new Date() };
    const updated = await contractsServer.updateContract(id, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}

/**
 *
 * @param _request
 * @param params
 * @returns
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await authenticateUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const contract = await contractsServer.getContractById(id);
    if (!contract) return jsonError('Contract not found', 404);
    if (contract.orgId !== orgId) return jsonError('Unauthorized', 401);

    await contractsServer.deleteContract(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}
