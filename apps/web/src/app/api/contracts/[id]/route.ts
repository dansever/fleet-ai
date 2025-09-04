import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as contractServer } from '@/modules/contracts/contracts';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const contract = await contractServer.getContractById(params.id);
    if (!contract) return jsonError('Contract not found', 404);
    if (contract.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    return NextResponse.json(contract);
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await contractServer.getContractById(params.id);
    if (!existing) return jsonError('Contract not found', 404);
    if (existing.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updateData = { ...body, updatedAt: new Date() };
    const updated = await contractServer.updateContract(params.id, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await contractServer.getContractById(params.id);
    if (!existing) return jsonError('Contract not found', 404);
    if (existing.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    await contractServer.deleteContract(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}
