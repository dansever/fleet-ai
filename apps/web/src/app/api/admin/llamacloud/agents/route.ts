// app/api/admin/llamacloud/agents/route.ts
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to check admin access
async function checkAdminAccess() {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) {
    return false;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return false;
  }

  // For now, we'll use a simplified check - in production, you'd want to check Clerk organization membership
  // This is a placeholder until proper Clerk organization role checking is implemented
  return true; // TODO: Implement proper organization owner/admin check
}

/**
 * ADMIN ONLY
 * GET /api/admin/llamacloud/agents - List all extraction agents
 */
export async function GET() {
  const hasAdminAccess = await checkAdminAccess();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: Replace with actual backend call when ready
    // This would call your Python backend to get agent status
    const agents = [
      {
        name: 'fleet-ai-contract-extractor',
        status: 'up-to-date',
        lastUpdated: '2024-01-15T10:30:00Z',
        schemaVersion: '1.2.0',
      },
      {
        name: 'fleet-ai-fuel-bid-extractor',
        status: 'needs-update',
        lastUpdated: '2024-01-10T14:20:00Z',
        schemaVersion: '1.1.0',
      },
      {
        name: 'fleet-ai-rfq-extractor',
        status: 'up-to-date',
        lastUpdated: '2024-01-14T09:15:00Z',
        schemaVersion: '1.3.0',
      },
    ];

    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list agents' }, { status: 500 });
  }
}

/**
 * ADMIN ONLY
 * POST /api/admin/llamacloud/agents - Update extraction agent schemas
 */
export async function POST(request: NextRequest) {
  const hasAdminAccess = await checkAdminAccess();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { agentName, updateAll = false } = await request.json();

    // TODO: Replace with actual backend call when ready
    // This would call your Python backend to update agent schemas

    if (updateAll) {
      // Update all agents that need updates
      return NextResponse.json({
        message: 'All agents updated successfully',
        updatedAgents: ['fleet-ai-fuel-bid-extractor'], // Mock response
      });
    } else if (agentName) {
      // Update specific agent
      return NextResponse.json({
        message: `Agent ${agentName} updated successfully`,
        agent: {
          name: agentName,
          status: 'up-to-date',
          lastUpdated: new Date().toISOString(),
          schemaVersion: '1.4.0',
        },
      });
    } else {
      return NextResponse.json({ error: 'Agent name or updateAll flag required' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update agents' }, { status: 500 });
  }
}
