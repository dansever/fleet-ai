// /api/extract/agent/[name]/route.ts

import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer } from '@/modules/extract';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { agentName: string };

/**
 * This API is used to get an extraction agent by name
 * @param request - the request with the agent name in the body
 * @returns the extraction agent
 */
export async function GET(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Read the query string
    const { agentName } = await params;
    if (!agentName) {
      return NextResponse.json({ error: 'Agent Name is required' }, { status: 400 });
    }

    // Get extraction agent using server function
    const agent = await extractServer.getExtractionAgent(agentName);
    return NextResponse.json(agent); // includes `id`
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
