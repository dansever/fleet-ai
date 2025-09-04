import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { invoiceLines as invoiceLinesServer } from '@/modules/invoices';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/invoice-lines/[id]
 * Get a specific invoice line by ID
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const invoiceLine = await invoiceLinesServer.getInvoiceLineById(params.id);

    if (!invoiceLine) {
      return jsonError('Invoice line not found', 404);
    }

    // Ensure user can only access invoice lines from their organization
    if (invoiceLine.orgId !== orgId) {
      return jsonError('Forbidden', 403);
    }

    return NextResponse.json(invoiceLine);
  } catch (error) {
    console.error('Error fetching invoice line:', error);
    return jsonError('Failed to fetch invoice line', 500);
  }
}

/**
 * PUT /api/invoice-lines/[id]
 * Update a specific invoice line
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Check if invoice line exists and user has access
    const existingInvoiceLine = await invoiceLinesServer.getInvoiceLineById(params.id);
    if (!existingInvoiceLine) {
      return jsonError('Invoice line not found', 404);
    }
    if (existingInvoiceLine.orgId !== orgId) {
      return jsonError('Forbidden', 403);
    }

    // Get request body
    const body = await request.json();

    // Prepare update payload
    const payload = {
      ...body,
    };

    const updatedInvoiceLine = await invoiceLinesServer.updateInvoiceLine(params.id, payload);

    return NextResponse.json(updatedInvoiceLine);
  } catch (error) {
    console.error('Error updating invoice line:', error);
    return jsonError('Failed to update invoice line', 500);
  }
}

/**
 * DELETE /api/invoice-lines/[id]
 * Delete a specific invoice line
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Check if invoice line exists and user has access
    const existingInvoiceLine = await invoiceLinesServer.getInvoiceLineById(params.id);
    if (!existingInvoiceLine) {
      return jsonError('Invoice line not found', 404);
    }
    if (existingInvoiceLine.orgId !== orgId) {
      return jsonError('Forbidden', 403);
    }

    await invoiceLinesServer.deleteInvoiceLine(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice line:', error);
    return jsonError('Failed to delete invoice line', 500);
  }
}
