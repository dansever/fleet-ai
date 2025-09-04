import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as rfqServer } from '@/modules/rfqs/';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };
const IdParam = z.string().uuid();

/**
 * GET /api/rfqs/[id] - Get an existing RFQ
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const parsedId = IdParam.safeParse(id);
    if (!parsedId.success) return jsonError('Invalid RFQ id', 400);

    const rfq = await rfqServer.getRfqById(parsedId.data, orgId);
    if (!rfq) return jsonError('RFQ not found', 404);

    return NextResponse.json(rfq);
  } catch (err) {
    console.error('Error getting RFQ:', err);
    return jsonError('Failed to get RFQ', 500);
  }
}

/**
 * PUT /api/rfqs/[id] - Update an existing RFQ
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  let rawId: string | undefined;
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    rawId = (await params).id;
    const id = decodeURIComponent(rawId);
    const parsedId = IdParam.safeParse(id);
    if (!parsedId.success) return jsonError('Invalid RFQ id', 400);

    // Ensure the RFQ exists and belongs to this org
    const existing = await rfqServer.getRfqById(parsedId.data, orgId);
    if (!existing) return jsonError('RFQ not found', 404);

    const body = await request.json();

    // Remove server-managed fields
    const {
      id: _id,
      orgId: _orgId,
      createdAt: _c,
      updatedAt: _u,
      ...payload
    } = body as Record<string, unknown>;

    // Perform update
    const updated = await rfqServer.updateRfq(parsedId.data, payload);
    if (!updated) return jsonError('Failed to update RFQ', 500);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[rfqs.id.PUT]', { id: rawId, err });
    return jsonError('Failed to update RFQ', 500);
  }
}

/**
 * DELETE /api/rfqs/[id] - Delete an existing RFQ
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  let rawId: string | undefined;
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    rawId = (await params).id;
    const id = decodeURIComponent(rawId);
    const parsedId = IdParam.safeParse(id);
    if (!parsedId.success) return jsonError('Invalid RFQ id', 400);

    // Check ownership via single query
    const rfq = await rfqServer.getRfqById(parsedId.data, orgId);
    if (!rfq) return jsonError('RFQ not found', 404);

    await rfqServer.deleteRfq(parsedId.data);
    return NextResponse.json({ message: 'RFQ deleted successfully' });
  } catch (err) {
    console.error('[rfqs.id.DELETE]', { id: rawId, err });
    return jsonError('Failed to delete RFQ', 500);
  }
}
