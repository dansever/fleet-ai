// src/app/api/invoices/explain/route.ts

import { explainInvoiceVariance } from '@/lib/ai/invoices/explain';
import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { dbUser, orgId, error } = await authenticateUser();
  if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

  try {
    const body = await req.json();
    const invoiceId: string | undefined = body?.invoiceId;
    if (!invoiceId) return jsonError('Missing invoiceId', 400);

    const result = await explainInvoiceVariance({ invoiceId, orgId, userId: dbUser.id });
    return NextResponse.json(result);
  } catch (e: any) {
    return jsonError(e?.message || 'Failed to explain invoice', 500);
  }
}
