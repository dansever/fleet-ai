import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as contractRulesServer } from '@/modules/contracts/contractRules';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/contract-rules/[id]
 * Get a specific contract rule by ID
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const contractRule = await contractRulesServer.getContractRuleById(params.id);

    if (!contractRule) {
      return jsonError('Contract rule not found', 404);
    }

    // Ensure user can only access contract rules from their organization
    if (contractRule.orgId !== orgId) {
      return jsonError('Forbidden', 403);
    }

    return NextResponse.json(contractRule);
  } catch (error) {
    console.error('Error fetching contract rule:', error);
    return jsonError('Failed to fetch contract rule', 500);
  }
}

/**
 * PUT /api/contract-rules/[id]
 * Update a specific contract rule
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Check if contract rule exists and user has access
    const existingContractRule = await contractRulesServer.getContractRuleById(params.id);
    if (!existingContractRule) {
      return jsonError('Contract rule not found', 404);
    }
    if (existingContractRule.orgId !== orgId) {
      return jsonError('Forbidden', 403);
    }

    // Get request body
    const body = await request.json();

    // Prepare update payload
    const payload = {
      ...body,
      // Convert string dates to Date objects if provided
      activeFrom: body.activeFrom ? new Date(body.activeFrom) : undefined,
      activeTo: body.activeTo ? new Date(body.activeTo) : undefined,
    };

    const updatedContractRule = await contractRulesServer.updateContractRule(params.id, payload);

    return NextResponse.json(updatedContractRule);
  } catch (error) {
    console.error('Error updating contract rule:', error);
    return jsonError('Failed to update contract rule', 500);
  }
}

/**
 * DELETE /api/contract-rules/[id]
 * Delete a specific contract rule
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Check if contract rule exists and user has access
    const existingContractRule = await contractRulesServer.getContractRuleById(params.id);
    if (!existingContractRule) {
      return jsonError('Contract rule not found', 404);
    }
    if (existingContractRule.orgId !== orgId) {
      return jsonError('Forbidden', 403);
    }

    await contractRulesServer.deleteContractRule(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contract rule:', error);
    return jsonError('Failed to delete contract rule', 500);
  }
}
