import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { documents } from '@/modules/file-manager';
import { NextRequest, NextResponse } from 'next/server';

const documentsServer = documents.server;

/**
 * POST /api/documents
 * Create a new document
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get request body
    const data = await request.json();
    const documentData = { ...data, orgId };

    // Create document
    const document = await documentsServer.createDocument(documentData);

    // Return document
    return NextResponse.json(document);
  } catch (err) {
    console.error('Error creating document:', err);
    return jsonError('Failed to create document', 500);
  }
}
