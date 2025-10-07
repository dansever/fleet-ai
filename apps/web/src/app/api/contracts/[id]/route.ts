import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { server as contractServer } from '@/modules/contracts';
import { server as documentsServer } from '@/modules/file-manager/documents';
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
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const contract = await contractServer.getContractById(id);
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
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const existing = await contractServer.getContractById(id);
    if (!existing) return jsonError('Contract not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updateData = { ...body, updatedAt: new Date() };
    const updated = await contractServer.updateContract(id, updateData);
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
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const existing = await contractServer.getContractById(id);
    if (!existing) return jsonError('Contract not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    /* TODO: Delete cascading documents */
    await documentsServer.deleteDocumentCascade(id, existing.storagePath);

    await contractServer.deleteContract(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}
