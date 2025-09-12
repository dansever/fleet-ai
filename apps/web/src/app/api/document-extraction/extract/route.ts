import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Document Extraction API
 * @param req request
 * @returns response
 */
export async function POST(req: NextRequest) {
  const { file_id, extraction_agent_id } = await req.json();
  if (!file_id || !extraction_agent_id) {
    return NextResponse.json(
      { error: 'file_id and extraction_agent_id are required' },
      { status: 400 },
    );
  }

  const res = await fetch(withCtx('/api/v1/extraction/jobs'), {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id, extraction_agent_id }),
  });

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });

  const job = await res.json(); // includes `id`
  return NextResponse.json(job);
}
