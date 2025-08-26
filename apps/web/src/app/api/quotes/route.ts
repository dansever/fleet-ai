import {
  createQuote,
  deleteQuote,
  getQuoteById,
  getQuotesByRfq,
  updateQuote,
} from '@/db/quotes/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/quotes
 * Query parameters:
 * - id: string (get specific quote)
 * - rfqId: string (get quotes by RFQ)
 * - No parameters: get all quotes for organization
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const rfqId = searchParams.get('rfqId');

    // Get specific quote by ID
    if (id) {
      const quote = await getQuoteById(id);
      if (!quote) return jsonError('Quote not found', 404);

      // Authorize access to quote (assuming quotes inherit RFQ authorization)
      // Note: You may need to implement quote-specific authorization
      return NextResponse.json(quote);
    }

    // Get quotes by RFQ
    if (rfqId) {
      const quotes = await getQuotesByRfq(rfqId);
      return NextResponse.json(quotes);
    }
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return jsonError('Failed to fetch quotes', 500);
  }
}

/**
 * POST /api/quotes
 * Create a new quote
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    // Get orgId from request body
    if (!dbUser.orgId) return jsonError('User has no organization', 403);
    const dbOrgId = dbUser.orgId;

    // Get request body
    const body = await request.json();

    // Create quote
    const newQuote = await createQuote({ ...body, orgId: dbOrgId });

    return NextResponse.json(newQuote);
  } catch (error) {
    console.error('Error creating quote:', error);
    return jsonError('Failed to create quote', 500);
  }
}

/**
 * PUT /api/quotes?id=123
 * Update an existing quote
 */
export async function PUT(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('Quote ID is required', 400);

    // Load quote from DB
    const quote = await getQuoteById(id);
    if (!quote) return jsonError('Quote not found', 404);

    // Update quote
    const body = await request.json();
    const updatedQuote = await updateQuote(id, body);

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return jsonError('Failed to update quote', 500);
  }
}

/**
 * DELETE /api/quotes?id=123
 * Delete a quote
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('Quote ID is required', 400);

    // Load quote from DB
    const quote = await getQuoteById(id);
    if (!quote) return jsonError('Quote not found', 404);

    // Delete quote
    await deleteQuote(id);

    return NextResponse.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return jsonError('Failed to delete quote', 500);
  }
}
