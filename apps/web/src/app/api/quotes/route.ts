import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as quoteServer } from '@/modules/quotes';
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
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get query params
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId');

    // Get quotes by RFQ
    if (rfqId) {
      const quotes = await quoteServer.listQuotesByRfqId(orgId, rfqId);
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
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get request body
    const body = await request.json();

    // Normalize sentAt when provided as string
    const payload = {
      ...body,
      orgId: orgId,
      ...(body.sentAt !== undefined ? { sentAt: body.sentAt ? new Date(body.sentAt) : null } : {}),
    };

    const newQuote = await quoteServer.createQuote(payload);

    return NextResponse.json(newQuote);
  } catch (error) {
    console.error('Error creating quote:', error);
    return jsonError('Failed to create quote', 500);
  }
}
