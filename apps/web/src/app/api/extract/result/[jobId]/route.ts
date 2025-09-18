import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer } from '@/modules/ai/extract';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { jobId: string };

/**
 * This API is used to get the result of an extraction job
 * @param req request
 * @returns the extraction result
 */
export async function GET(req: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (!dbUser || !orgId || error) {
      return jsonError('Unauthorized', 401);
    }

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    // Get job result using server function
    const json = await extractServer.getExtractionJobResult(jobId);

    // Record usage for billing/analytics
    await extractServer.recordExtractionUsage(json, dbUser.id, orgId);

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
