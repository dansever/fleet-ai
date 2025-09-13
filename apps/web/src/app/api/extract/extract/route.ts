import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This API is used to start an extraction job for a file using an extraction agent
 * @param req request with file_id and extraction_agent_id in body
 * @returns the extraction job with job ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file_id, extraction_agent_id } = body;

    if (!file_id || !extraction_agent_id) {
      return NextResponse.json(
        { error: 'Both file_id and extraction_agent_id are required in request body' },
        { status: 400 },
      );
    }

    const res = await fetch(withCtx('/api/v1/extraction/jobs'), {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id, extraction_agent_id }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const job = await res.json();
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
