import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
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
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const res = await fetch(withCtx(`/api/v1/extraction/jobs/${jobId}`), {
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
