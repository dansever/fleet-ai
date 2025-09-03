import { createQuote, getQuotesByRfq } from '@/db/technical-procurement/quotes/db-actions';
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
    const rfqId = searchParams.get('rfqId');

    // Get quotes by RFQ
    if (rfqId) {
      const quotes = await getQuotesByRfq(rfqId);
      return NextResponse.json(quotes);
    }

    // No rfqId provided: return empty list for now to avoid unexpected broad queries
    // If needed, implement org-wide quotes listing similarly to RFQs
    return NextResponse.json([]);
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

    // Normalize sentAt when provided as string
    const payload = {
      ...body,
      orgId: dbOrgId,
      ...(body.sentAt !== undefined ? { sentAt: body.sentAt ? new Date(body.sentAt) : null } : {}),
    };

    const newQuote = await createQuote(payload);

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
// Note: PUT/DELETE moved to /api/quotes/[id]
