import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as orgServer } from '@/modules/core/organizations';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/orgs/[id]
 * Get an existing organization
 * @param _request
 * @param params
 * @returns
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get org id
    const { id } = await params;
    if (id !== orgId) return jsonError('Unauthorized', 401);

    // Get org by id
    const org = await orgServer.getOrgById(id);
    if (!org) return jsonError('Organization not found', 404);
    return NextResponse.json(org);
  } catch (error) {
    return jsonError('Failed to fetch organization', 500);
  }
}

/**
 * PUT /api/orgs/[id]
 * Update an existing organization
 * @param request
 * @param params
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get org by id
    const { id } = await params;
    const existing = await orgServer.getOrgById(id);
    if (!existing) return jsonError('Organization not found', 404);
    if (existing.id !== orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updated = await orgServer.updateOrg(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Failed to update organization', 500);
  }
}

/**
 * DELETE /api/orgs/[id]
 * Delete an existing organization
 * @param _request
 * @param params
 * @returns
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get org by id
    const { id } = await params;
    const existing = await orgServer.getOrgById(id);
    if (!existing) return jsonError('Organization not found', 404);
    if (existing.id !== orgId) return jsonError('Unauthorized', 401);

    // Delete org
    await orgServer.deleteOrg(id);
    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete organization', 500);
  }
}
