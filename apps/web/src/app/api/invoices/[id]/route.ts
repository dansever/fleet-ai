import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as invoicesServer } from '@/modules/invoices';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get invoice by id
    const { id } = await params;
    const invoice = await invoicesServer.getInvoiceById(id);
    if (!invoice) return jsonError('Invoice not found', 404);
    if (invoice.orgId !== orgId) return jsonError('Unauthorized', 401);

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return jsonError('Failed to fetch invoice', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get invoice by id
    const { id } = await params;
    const existing = await invoicesServer.getInvoiceById(id);
    if (!existing) return jsonError('Invoice not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    const body = await request.json();
    const payload = {
      ...body,
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
      periodStart: body.periodStart ? new Date(body.periodStart) : undefined,
      periodEnd: body.periodEnd ? new Date(body.periodEnd) : undefined,
    };

    const updated = await invoicesServer.updateInvoice(id, payload);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return jsonError('Failed to update invoice', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get invoice by id
    const { id } = await params;
    const existing = await invoicesServer.getInvoiceById(id);
    if (!existing) return jsonError('Invoice not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Delete invoice
    await invoicesServer.deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return jsonError('Failed to delete invoice', 500);
  }
}
