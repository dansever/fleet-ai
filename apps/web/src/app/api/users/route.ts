import {
  createUser,
  deleteUser,
  getOrgUsers,
  getUserById,
  updateUser,
} from '@/db/users/db-actions';
import { NewUser } from '@/drizzle/types';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/error';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/users
 * Query parameters:
 * - id: string (get specific user by DB ID)
 * - orgId: string (get users by organization - defaults to current user's org)
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const requestedOrgId = searchParams.get('orgId') || orgId;

    // Get specific user by DB ID
    if (id) {
      const user = await getUserById(id);
      if (!user) return jsonError('User not found', 404);

      // Authorize access (user can only access users in their org)
      if (user.orgId !== orgId) return jsonError('Unauthorized', 401);

      return NextResponse.json(user);
    }

    // Get users by organization (only allow current user's org)
    if (requestedOrgId !== orgId) return jsonError('Unauthorized', 401);

    const users = await getOrgUsers(requestedOrgId);
    return NextResponse.json(users);
  } catch (error) {
    return jsonError('Failed to fetch users', 500);
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    if (!dbUser.orgId) return jsonError('User has no organization', 403);

    // Get request body
    const body = await request.json();

    // Prepare user data
    const userData: NewUser = {
      ...body,
      orgId: body.orgId || dbUser.orgId,
    };

    // Create user
    const newUser = await createUser(userData);
    if (!newUser) return jsonError('Failed to create user (may already exist)', 400);

    return NextResponse.json(newUser);
  } catch (error) {
    return jsonError('Failed to create user', 500);
  }
}

/**
 * PUT /api/users?id=123
 * Update an existing user
 */
export async function PUT(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    if (!dbUser.orgId) return jsonError('User has no organization', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('User ID is required', 400);

    // Load user from DB
    const user = await getUserById(id);
    if (!user) return jsonError('User not found', 404);

    // Authorize access (user can only update users in their org)
    if (user.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    // Update user
    const body = await request.json();
    const updatedUser = await updateUser(id, body);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return jsonError('Failed to update user', 500);
  }
}

/**
 * DELETE /api/users?id=123
 * Delete a user
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('User ID is required', 400);

    // Load user from DB
    const user = await getUserById(id);
    if (!user) return jsonError('User not found', 404);

    // Authorize access (user can only delete users in their org)
    if (user.orgId !== dbUser.orgId) return jsonError('Unauthorized', 401);

    // Delete user
    await deleteUser(id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return jsonError('Failed to delete user', 500);
  }
}
