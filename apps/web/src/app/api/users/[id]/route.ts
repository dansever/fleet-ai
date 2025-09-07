import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as userServer } from '@/modules/core/users';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const user = await userServer.getUserById(params.id);
    if (!user) return jsonError('User not found', 404);
    if (user.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    return NextResponse.json(user);
  } catch (error) {
    return jsonError('Failed to fetch user', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await userServer.getUserById(params.id);
    if (!existing) return jsonError('User not found', 404);
    if (existing.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const updated = await userServer.updateUser(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError('Failed to update user', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await userServer.getUserById(params.id);
    if (!existing) return jsonError('User not found', 404);
    if (existing.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    await userServer.deleteUser(params.id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete user', 500);
  }
}
