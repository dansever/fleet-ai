import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as userServer } from '@/modules/core/users';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/users/[id]
 * Get a user by id
 * @param _request
 * @param params
 * @returns
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const user = await userServer.getUserById(id);
    if (!user) return jsonError('User not found', 404);
    if (user.orgId !== orgId) return jsonError('Unauthorized', 401);

    return NextResponse.json(user);
  } catch (error) {
    return jsonError('Failed to fetch user', 500);
  }
}

/**
 * PUT /api/users/[id]
 * Update a user
 * @param request
 * @param params
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get user by id
    const { id } = await params;
    const existing = await userServer.getUserById(id);
    if (!existing) return jsonError('User not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Update user
    const body = await request.json();
    const updated = await userServer.updateUser(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Failed to update user', 500);
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user
 * @param _request
 * @param params
 * @returns
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get user by id
    const { id } = await params;
    const existing = await userServer.getUserById(id);
    if (!existing) return jsonError('User not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Delete user
    await userServer.deleteUser(id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete user', 500);
  }
}
