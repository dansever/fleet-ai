import {
  createOrg,
  deleteOrgById,
  getOrgByClerkOrgId,
  getOrgById,
  updateOrg,
} from '@/db/orgs/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/error';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orgs
 * Query parameters:
 * - id: string (get specific org by DB ID)
 * - clerkOrgId: string (get org by Clerk ID)
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const userOrgId = dbUser.orgId;
    if (!userOrgId) return jsonError('User has no organization', 403);

    // Get query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clerkOrgId = searchParams.get('clerkOrgId');

    // Get specific org by DB ID
    if (id) {
      // User can only access their own organization
      if (id !== userOrgId) return jsonError('Unauthorized', 401);

      const org = await getOrgById(id);
      if (!org) return jsonError('Organization not found', 404);

      return NextResponse.json(org);
    }

    // Get org by Clerk ID
    if (clerkOrgId) {
      const org = await getOrgByClerkOrgId(clerkOrgId);
      if (!org) return jsonError('Organization not found', 404);

      // User can only access their own organization
      if (org.id !== userOrgId) return jsonError('Unauthorized', 401);

      return NextResponse.json(org);
    }

    // Default: Get current user's organization
    const org = await getOrgById(userOrgId);
    if (!org) return jsonError('Organization not found', 404);

    return NextResponse.json(org);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return jsonError('Failed to fetch organization', 500);
  }
}

/**
 * POST /api/orgs
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user (typically for system/admin operations)
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get request body
    const body = await request.json();

    // Create organization
    const newOrg = await createOrg(body);

    return NextResponse.json(newOrg);
  } catch (error) {
    console.error('Error creating organization:', error);
    return jsonError('Failed to create organization', 500);
  }
}

/**
 * PUT /api/orgs?id=123
 * Update an existing organization
 */
export async function PUT(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('Organization ID is required', 400);

    // User can only update their own organization
    if (id !== dbUser.orgId) return jsonError('Unauthorized', 401);

    // Load org from DB
    const org = await getOrgById(id);
    if (!org) return jsonError('Organization not found', 404);

    // Update organization
    const body = await request.json();
    const updatedOrg = await updateOrg(id, body);

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error('Error updating organization:', error);
    return jsonError('Failed to update organization', 500);
  }
}

/**
 * DELETE /api/orgs?id=123
 * Delete an organization
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorize user (typically restricted to super admin)
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('Organization ID is required', 400);

    // User can only delete their own organization (if allowed)
    if (id !== dbUser.orgId) return jsonError('Unauthorized', 401);

    // Load org from DB
    const org = await getOrgById(id);
    if (!org) return jsonError('Organization not found', 404);

    // Delete organization
    await deleteOrgById(id);

    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return jsonError('Failed to delete organization', 500);
  }
}
