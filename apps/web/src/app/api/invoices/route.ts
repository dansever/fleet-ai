import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { server as invoicesServer } from '@/modules/invoices';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/invoices
 * Query parameters:
 * - contractId: string (get invoices by contract)
 * - orgId: string (get invoices by organization)
 */
export async function GET(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const queryOrgId = searchParams.get('orgId');

    if (contractId) {
      const invoices = await invoicesServer.listInvoicesByContract(contractId);
      return NextResponse.json(invoices);
    }

    if (queryOrgId) {
      if (queryOrgId !== orgId) return jsonError('Forbidden', 403);
      const invoices = await invoicesServer.listInvoicesByOrg(queryOrgId);
      return NextResponse.json(invoices);
    }

    // Default: list by org of current user
    const invoices = await invoicesServer.listInvoicesByOrg(orgId);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return jsonError('Failed to fetch invoices', 500);
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const payload = {
      ...body,
      orgId,
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : null,
      periodStart: body.periodStart ? new Date(body.periodStart) : null,
      periodEnd: body.periodEnd ? new Date(body.periodEnd) : null,
    };

    const created = await invoicesServer.createInvoice(payload);
    return NextResponse.json(created);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return jsonError('Failed to create invoice', 500);
  }
}
