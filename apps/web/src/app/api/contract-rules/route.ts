import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as contractRulesServer } from '@/modules/contracts/contractRules';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/contract-rules
 * Query parameters:
 * - contractId: string (get contract rules by contract)
 * - No parameters: get all contract rules for organization
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get query params
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    // Get contract rules by contract
    if (contractId) {
      const contractRules = await contractRulesServer.listContractRulesByContractId(contractId);
      return NextResponse.json(contractRules);
    }

    // No contractId provided: return empty list for now to avoid unexpected broad queries
    // If needed, implement org-wide contract rules listing
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching contract rules:', error);
    return jsonError('Failed to fetch contract rules', 500);
  }
}

/**
 * POST /api/contract-rules
 * Create a new contract rule
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get request body
    const body = await request.json();

    // Add organization ID to payload
    const payload = {
      ...body,
      orgId: orgId,
      // Convert string dates to Date objects if provided
      activeFrom: body.activeFrom ? new Date(body.activeFrom) : null,
      activeTo: body.activeTo ? new Date(body.activeTo) : null,
    };

    const newContractRule = await contractRulesServer.createContractRule(payload);

    return NextResponse.json(newContractRule);
  } catch (error) {
    console.error('Error creating contract rule:', error);
    return jsonError('Failed to create contract rule', 500);
  }
}
