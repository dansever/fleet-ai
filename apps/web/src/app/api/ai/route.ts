// src/app/api/ai/route.ts

import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { server as aiServer } from '@/modules/ai';
import { server as organizationServer } from '@/modules/core/organizations';
import { server as userServer } from '@/modules/core/users';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  prompt: z.string().min(1).max(8000),
});

/**
 * AI API
 * @param request
 * @returns
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const json = await request.json();
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    // Call AI
    const response = await aiServer.callLLM(parse.data.prompt);

    // Update user and organization usage
    const tokenUsage = response.usage?.totalTokens || 0;
    userServer.updateUserUsage(dbUser.id, {
      aiTokensUsed: tokenUsage,
    });
    organizationServer.updateOrgUsage(orgId, {
      aiTokenUsage: tokenUsage,
    });

    // Return response
    return NextResponse.json({ output: response });
  } catch (err) {
    console.error('AI API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
