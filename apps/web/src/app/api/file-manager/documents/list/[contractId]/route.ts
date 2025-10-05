import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { documents } from '@/modules/file-manager';
import { NextRequest, NextResponse } from 'next/server';

const documentsServer = documents.server;

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
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get contract id
    const { contractId } = await params;
    if (!contractId) {
      return jsonError('Contract ID is required', 400);
    }

    // Get documents by contract
    const documents = await documentsServer.listDocumentsByContract(contractId);
    if (!documents) {
      return jsonError('Documents not found', 404);
    }

    // Return documents
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return jsonError('Failed to fetch documents', 500);
  }
}
