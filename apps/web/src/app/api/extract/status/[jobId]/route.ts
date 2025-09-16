import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer } from '@/modules/extract';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { jobId: string };

/**
 * This API is used to get the status of an extraction job
 * Supports both query parameter (?jobId=) and path parameter patterns
 * @param req request
 * @returns the extraction status
 */
export async function GET(req: NextRequest, { params }: { params: RouteParams }) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    // Get job status using server function
    const json = await extractServer.getExtractionJobStatus(jobId);
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
