import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as orgServer } from '@/modules/core/organizations';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    if (params.id !== orgId) return jsonError('Unauthorized', 401);

    const org = await orgServer.getOrgById(params.id);
    if (!org) return jsonError('Organization not found', 404);
    return NextResponse.json(org);
  } catch (error) {
    return jsonError('Failed to fetch organization', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    if (params.id !== orgId) return jsonError('Unauthorized', 401);

    const existing = await orgServer.getOrgById(params.id);
    if (!existing) return jsonError('Organization not found', 404);

    const body = await request.json();
    const updated = await orgServer.updateOrg(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Failed to update organization', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    if (params.id !== orgId) return jsonError('Unauthorized', 401);

    const existing = await orgServer.getOrgById(params.id);
    if (!existing) return jsonError('Organization not found', 404);

    await orgServer.deleteOrg(params.id);
    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete organization', 500);
  }
}
