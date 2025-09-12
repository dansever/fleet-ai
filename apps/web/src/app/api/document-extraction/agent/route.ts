import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { NextResponse } from 'next/server';

/**
 * Document Extraction Agent API
 * @returns response
 */
export async function GET() {
  const name = 'fleet-ai-contract-extractor';
  const res = await fetch(
    withCtx(`/api/v1/extraction/extraction-agents/by-name/${encodeURIComponent(name)}`),
    {
      headers: authHeaders(),
    },
  );
  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  }
  const agent = await res.json();
  return NextResponse.json(agent); // includes `id`
}
