import { NextRequest, NextResponse } from 'next/server';

import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';

import {
  deleteRfq as deleteRfqServer,
  getRfqById,
  updateRfq as updateRfqServer,
} from '@/modules/rfqs/rfqs.server';

import { RfqUpdateTransportSchema, toUpdateModel } from '@/modules/rfqs/rfqs.types';

type RouteParams = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const rfq = await getRfqById(params.id);
    if (!rfq) return jsonError('RFQ not found', 404);
    if (!authorizeResource(rfq, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(rfq);
  } catch (err) {
    console.error('Error getting RFQ:', err);
    return jsonError('Failed to get RFQ', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await getRfqById(params.id);
    if (!existing) return jsonError('RFQ not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const parsed = RfqUpdateTransportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const model = toUpdateModel(parsed.data);

    const updated = await updateRfqServer(params.id, model);
    if (!updated) return jsonError('RFQ not found', 404);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating RFQ:', err);
    return jsonError('Failed to update RFQ', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const rfq = await getRfqById(params.id);
    if (!rfq) return jsonError('RFQ not found', 404);
    if (!authorizeResource(rfq, dbUser)) return jsonError('Unauthorized', 401);

    await deleteRfqServer(params.id);
    return NextResponse.json({ message: 'RFQ deleted successfully' });
  } catch (err) {
    console.error('Error deleting RFQ:', err);
    return jsonError('Failed to delete RFQ', 500);
  }
}
