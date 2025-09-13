import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { server as extractorServer } from '@/modules/documents/extract';
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
      return NextResponse.json({ error: error }, { status: 401 });
    }

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const res = await fetch(withCtx(`/api/v1/extraction/jobs/${jobId}/result`), {
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const json = await res.json();

    // Record usage for billing/analytics
    extractorServer.recordExtractionUsage(json, dbUser.id, orgId);

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
