import { getQuotesByOrgForAnalysis } from '@/db/quotes/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/quotes/analyze
 * Analyze quotes for a given RFQ
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser || !dbUser.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { rfqId } = body;

    if (!rfqId) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }

    // Get quotes from database (server-side access)
    const quotes = await getQuotesByOrgForAnalysis(dbUser.orgId, rfqId);

    if (quotes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No quotes found for analysis',
        data: {
          rfqId,
          quotes: [],
          analysis: 'No quotes available for analysis',
        },
      });
    }

    // Return quotes data - the actual analysis will be done by the backend
    return NextResponse.json({
      success: true,
      message: 'Quotes retrieved successfully',
      data: {
        rfqId,
        quotes,
        quotesCount: quotes.length,
      },
    });
  } catch (error) {
    console.error('Error in quotes analysis API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
