import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer } from '@/modules/documents/extract';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This API is used to start an extraction job for a file using an extraction agent
 * @param req request with file_id and extraction_agent_id in body
 * @returns the extraction job with job ID
 */
export async function POST(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const body = await req.json();
    const { file_id, extraction_agent_id } = body;

    // Start extraction job using server function
    const job = await extractServer.startExtractionJob(file_id, extraction_agent_id);
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
