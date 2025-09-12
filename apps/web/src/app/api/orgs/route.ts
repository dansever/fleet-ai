import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as orgServer } from '@/modules/core/organizations';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/orgs
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user (typically for system/admin operations)
    const { dbUser, error, orgId } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get request body
    const body = await request.json();

    // Create organization
    const newOrg = await orgServer.createOrg({ ...body });

    return NextResponse.json(newOrg);
  } catch (error) {
    console.error('Error creating organization:', error);
    return jsonError('Failed to create organization', 500);
  }
}
