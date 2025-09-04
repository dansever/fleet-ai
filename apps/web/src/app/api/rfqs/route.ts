import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as rfqServer } from '@/modules/rfqs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Query params: optional filters
const ListQuerySchema = z.object({
  direction: z.enum(['sent', 'received']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await authorizeUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const params = ListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const { direction } = params;

    const rfqs = await rfqServer.listRfqsByOrgIdAndDirection(orgId, direction);
    return NextResponse.json(rfqs);
  } catch (err) {
    console.error('Error fetching RFQs:', err);
    return jsonError('Failed to fetch RFQs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await authorizeUser();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const newRfq = await rfqServer.createRfq({ ...body, orgId });

    return NextResponse.json(newRfq, { status: 201 });
  } catch (err) {
    console.error('Error creating RFQ:', err);
    return jsonError('Failed to create RFQ', 500);
  }
}
