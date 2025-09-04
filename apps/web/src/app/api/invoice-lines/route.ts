import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as invoiceLinesServer } from '@/modules/invoices/invoice-lines';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/invoice-lines
 * Query parameters:
 * - invoiceId: string (get invoice lines by invoice)
 * - No parameters: get all invoice lines for organization
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get query params
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    // Get invoice lines by invoice
    if (invoiceId) {
      const invoiceLines = await invoiceLinesServer.listInvoiceLinesByInvoiceId(invoiceId);
      return NextResponse.json(invoiceLines);
    }

    // No invoiceId provided: return empty list for now to avoid unexpected broad queries
    // If needed, implement org-wide invoice lines listing
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching invoice lines:', error);
    return jsonError('Failed to fetch invoice lines', 500);
  }
}

/**
 * POST /api/invoice-lines
 * Create a new invoice line
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get request body
    const body = await request.json();

    // Add organization ID to payload
    const payload = {
      ...body,
      orgId: orgId,
    };

    const newInvoiceLine = await invoiceLinesServer.createInvoiceLine(payload);

    return NextResponse.json(newInvoiceLine);
  } catch (error) {
    console.error('Error creating invoice line:', error);
    return jsonError('Failed to create invoice line', 500);
  }
}
