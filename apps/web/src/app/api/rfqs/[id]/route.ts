import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as rfqServer } from '@/modules/rfqs/';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await authorizeUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const rfq = await rfqServer.getRfqById(params.id);
    if (!rfq) return jsonError('RFQ not found', 404);
    if (rfq.orgId !== orgId) return jsonError('Unauthorized', 401);

    return NextResponse.json(rfq);
  } catch (err) {
    console.error('Error getting RFQ:', err);
    return jsonError('Failed to get RFQ', 500);
  }
}

/**
 * PUT /api/rfqs/[id] -  Update an existing RFQ
 * @param request - The request body
 * @param params - The route parameters
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await authorizeUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const existingRfq = await rfqServer.getRfqById(params.id);
    if (!existingRfq) return jsonError('RFQ not found', 404);
    if (existingRfq.orgId !== orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();

    const updated = await rfqServer.updateRfq(params.id, body);
    if (!updated) return jsonError('RFQ not found', 404);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating RFQ:', err);
    return jsonError('Failed to update RFQ', 500);
  }
}

/**
 * DELETE /api/rfqs/[id] - Delete an existing RFQ
 * @param _req - The request
 * @param params - The route parameters
 * @returns
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await authorizeUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const rfq = await rfqServer.getRfqById(params.id);
    if (!rfq) return jsonError('RFQ not found', 404);
    if (rfq.orgId !== orgId) return jsonError('Unauthorized', 401);

    await rfqServer.deleteRfq(params.id);
    return NextResponse.json({ message: 'RFQ deleted successfully' });
  } catch (err) {
    console.error('Error deleting RFQ:', err);
    return jsonError('Failed to delete RFQ', 500);
  }
}
