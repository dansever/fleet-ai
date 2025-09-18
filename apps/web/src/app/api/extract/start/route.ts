import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer } from '@/modules/ai/extract';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This API is used to start an extraction job for an uploaded file using an extraction agent
 * @param req request with file_id and extraction_agent_id in body
 * @returns the extraction job with job ID
 */
export async function POST(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const body = await req.formData();
    const file = body.get('file') as File;
    const extraction_agent_name = body.get('extraction_agent_name') as ExtractionAgentName;

    // Start extraction
    const result = await extractServer.fileExtractorOrchestrator(file, extraction_agent_name);

    // Return result
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
