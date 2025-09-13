import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as documentsServer } from '@/modules/documents/documents';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ contractId: string }> };

/**
 * Get documents by contract
 * @param request - The request object.
 * * Query parameters:
 * - contractId: string (get documents by contract)
 * - orgId: string (get documents by organization)
 * @returns The documents
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

  const { contractId } = await params;
  if (!contractId) {
    return jsonError('Contract ID is required', 400);
  }
  const documents = await documentsServer.listDocumentsByContract(contractId);
  return NextResponse.json(documents);
}
