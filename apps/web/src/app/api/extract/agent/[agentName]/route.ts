// /api/extract/agent/[name]/route.ts

import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { agentName: string };

/**
 * This API is used to get an extraction agent by name
 * @param request - the request with the agent name in the body
 * @returns the extraction agent
 */
export async function GET(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    // read the query string
    const { agentName } = await params;
    if (!agentName) {
      return NextResponse.json({ error: 'Agent Name is required' }, { status: 400 });
    }

    const res = await fetch(
      withCtx(`/api/v1/extraction/extraction-agents/by-name/${encodeURIComponent(agentName)}`),
      {
        headers: authHeaders(),
      },
    );
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: res.status });
    }
    const agent = await res.json();
    return NextResponse.json(agent); // includes `id`
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
