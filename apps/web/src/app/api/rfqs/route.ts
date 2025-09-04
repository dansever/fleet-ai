import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as rfqServer } from '@/modules/rfqs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Query params: optional filters
const ListQuerySchema = z.object({
  direction: z.enum(['sent', 'received']).optional(),
});

/**
 * GET /api/rfqs - List all RFQs for an organization
 */
export async function GET(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = ListQuerySchema.safeParse(query);
    if (!parsed.success) return jsonError('Invalid query parameters', 400);
    const { direction } = parsed.data;

    const rfqs = await rfqServer.listRfqsByOrgIdAndDirection(orgId, direction);
    return NextResponse.json(rfqs);
  } catch (err) {
    console.error('[rfqs.GET]', err);
    return jsonError('Failed to fetch RFQs', 500);
  }
}

/**
 * POST /api/rfqs - Create a new RFQ
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }
    if (typeof body !== 'object' || body === null) {
      return jsonError('Invalid request body', 400);
    }

    // Strip server-managed fields
    const {
      id: _id,
      orgId: _orgId,
      createdAt: _c,
      updatedAt: _u,
      ...payload
    } = body as Record<string, unknown>;

    const newRfq = await rfqServer.createRfq({
      ...payload,
      orgId,
      userId: dbUser.id,
    });

    if (!newRfq) return jsonError('Failed to create RFQ', 500);

    return NextResponse.json(newRfq, { status: 201 });
  } catch (err) {
    return jsonError('Failed to create RFQ', 500);
  }
}
