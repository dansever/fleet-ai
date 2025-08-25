import {
  createRfq,
  deleteRfq,
  getRecentOrgRfqs,
  getRfqById,
  getRfqsByOrg,
  getUserRfqs,
  updateRfq,
} from '@/db/rfqs/db-actions';
import { NewRfq } from '@/drizzle/types';
import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/rfqs
 * Query parameters:
 * - id: string (get specific RFQ)
 * - userId: string (get RFQs by user)
 * - days: number (get recent RFQs)
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
    const userId = searchParams.get('userId');
    const days = searchParams.get('days');

    // Get specific RFQ by ID
    if (id) {
      const rfq = await getRfqById(id);
      if (!rfq) return jsonError('RFQ not found', 404);

      // Authorize access to RFQ
      if (!authorizeResource(rfq, dbUser)) return jsonError('Unauthorized', 401);

      return NextResponse.json(rfq);
    }

    // Get RFQs by user
    if (userId) {
      const rfqs = await getUserRfqs(userId);
      return NextResponse.json(rfqs);
    }

    // Get recent RFQs (default = last 7 days)
    if (days) {
      const rfqs = await getRecentOrgRfqs(orgId, parseInt(days, 7));
      return NextResponse.json(rfqs);
    }

    // Default: Get all RFQs for organization
    const rfqs = await getRfqsByOrg(orgId);
    return NextResponse.json(rfqs);
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return jsonError('Failed to fetch RFQs', 500);
  }
}

/**
 * POST /api/rfqs
 * Create a new RFQ
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    if (!dbUser.orgId) return jsonError('User has no organization', 403);

    // Get request body
    const body = await request.json();

    // Prepare RFQ data with user and org info
    // Convert ISO strings back to Date objects for timestamp fields
    const rfqData: NewRfq = {
      ...body,
      userId: dbUser.id,
      orgId: dbUser.orgId,
      // Convert timestamp strings to Date objects (or null)
      sentAt: body.sentAt ? new Date(body.sentAt) : null,
    };

    // Create RFQ
    const newRfq = await createRfq(rfqData);

    return NextResponse.json(newRfq);
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return jsonError('Failed to create RFQ', 500);
  }
}

/**
 * PUT /api/rfqs?id=123
 * Update an existing RFQ
 */
export async function PUT(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('RFQ ID is required', 400);

    // Load RFQ from DB
    const rfq = await getRfqById(id);
    if (!rfq) return jsonError('RFQ not found', 404);

    // Authorize access to RFQ
    if (!authorizeResource(rfq, dbUser)) return jsonError('Unauthorized', 401);

    // Update RFQ
    const body = await request.json();

    // Convert timestamp strings to Date objects for update data
    const updateData = {
      ...body,
      // Convert timestamp strings to Date objects (or null)
      sentAt: body.sentAt ? new Date(body.sentAt) : null,
      receivedAt: body.receivedAt ? new Date(body.receivedAt) : null,
    };

    const updatedRfq = await updateRfq(id, updateData);

    return NextResponse.json(updatedRfq);
  } catch (error) {
    console.error('Error updating RFQ:', error);
    return jsonError('Failed to update RFQ', 500);
  }
}

/**
 * DELETE /api/rfqs?id=123
 * Delete an RFQ
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('RFQ ID is required', 400);

    // Load RFQ from DB
    const rfq = await getRfqById(id);
    if (!rfq) return jsonError('RFQ not found', 404);

    // Authorize access to RFQ
    if (!authorizeResource(rfq, dbUser)) return jsonError('Unauthorized', 401);

    // Delete RFQ
    await deleteRfq(id);

    return NextResponse.json({ message: 'RFQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting RFQ:', error);
    return jsonError('Failed to delete RFQ', 500);
  }
}
