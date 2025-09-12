import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Document Extraction Status API
 * @param req request
 * @returns response
 */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 });

  const res = await fetch(withCtx(`/api/v1/extraction/jobs/${jobId}`), {
    headers: authHeaders(),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });

  const json = await res.json(); // includes status
  return NextResponse.json(json);
}
