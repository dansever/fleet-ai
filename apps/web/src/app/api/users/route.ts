import { NewUser } from '@/drizzle/types';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as userServer } from '@/modules/core/users';
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
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get query params
    const { searchParams } = new URL(request.url);
    const requestedOrgId = searchParams.get('orgId') || orgId;

    // Get users by organization (only allow current user's org)
    if (requestedOrgId !== orgId) return jsonError('Unauthorized', 401);

    const users = await userServer.listUsersByOrgId(requestedOrgId);
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
    const { dbUser, error } = await getAuthContext();
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
    const newUser = await userServer.createUser(userData);
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
// PUT/DELETE moved to /api/users/[id]
