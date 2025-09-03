import {
  deleteQuote,
  getQuoteById,
  updateQuote,
} from '@/db/technical-procurement/quotes/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

/**
 * GET /api/quotes/[id]
 * Fetch a single quote by id
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const quote = await getQuoteById(params.id);
    if (!quote) return jsonError('Quote not found', 404);
    if (quote.orgId !== dbUser.orgId) return jsonError('Forbidden', 403);

    return NextResponse.json(quote);
  } catch (err) {
    console.error('Error fetching quote by id:', err);
    return jsonError('Failed to fetch quote', 500);
  }
}

/**
 * PUT /api/quotes/[id]
 * Update an existing quote
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await getQuoteById(params.id);
    if (!existing) return jsonError('Quote not found', 404);
    if (existing.orgId !== dbUser.orgId) return jsonError('Forbidden', 403);

    const body = await request.json();
    const payload = {
      ...body,
      // Normalize sentAt to Date when provided as string
      ...(body.sentAt !== undefined ? { sentAt: body.sentAt ? new Date(body.sentAt) : null } : {}),
    };

    const updated = await updateQuote(params.id, payload);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating quote:', err);
    return jsonError('Failed to update quote', 500);
  }
}

/**
 * DELETE /api/quotes/[id]
 * Delete a quote
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await getQuoteById(params.id);
    if (!existing) return jsonError('Quote not found', 404);
    if (existing.orgId !== dbUser.orgId) return jsonError('Forbidden', 403);

    await deleteQuote(params.id);
    return NextResponse.json({ message: 'Quote deleted successfully' });
  } catch (err) {
    console.error('Error deleting quote:', err);
    return jsonError('Failed to delete quote', 500);
  }
}
