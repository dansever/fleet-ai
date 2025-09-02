import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';

import {
  createRfq as createRfqServer,
  listOrgRfqsByDirection,
  listUserRfqs,
} from '@/modules/rfqs/rfqs.server';

import { RfqCreateTransportSchema, toCreateModel } from '@/modules/rfqs/rfqs.types';

// Query params: optional filters
const ListQuerySchema = z.object({
  direction: z.enum(['sent', 'received']).optional(),
  userId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);
    if (!dbUser.orgId) return jsonError('User has no organization', 403);

    const parsed = ListQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { direction, userId } = parsed.data;

    if (userId) {
      const rfqs = await listUserRfqs(userId);
      return NextResponse.json(rfqs);
    }

    const dir = direction ?? 'sent';
    const rfqs = await listOrgRfqsByDirection(dbUser.orgId, dir);
    return NextResponse.json(rfqs);
  } catch (err) {
    console.error('Error fetching RFQs:', err);
    return jsonError('Failed to fetch RFQs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);
    if (!dbUser.orgId) return jsonError('User has no organization', 403);

    const body = await request.json();
    const parsed = RfqCreateTransportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Convert transport DTO to server model and inject orgId and userId
    const model = toCreateModel(parsed.data, {
      orgId: dbUser.orgId,
      userId: dbUser.id,
    });

    const newRfq = await createRfqServer(model);

    // Optional: verify the new resource is visible to the user
    if (!authorizeResource(newRfq, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(newRfq, { status: 201 });
  } catch (err) {
    console.error('Error creating RFQ:', err);
    return jsonError('Failed to create RFQ', 500);
  }
}
