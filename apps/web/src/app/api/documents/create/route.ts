import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as documentsServer } from '@/modules/documents/documents';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/documents
 * Create a new document
 */
export async function POST(request: NextRequest) {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

  try {
    const data = await request.json();
    const documentData = { ...data, orgId };
    const document = await documentsServer.createDocument(documentData);
    return NextResponse.json(document);
  } catch (err) {
    console.error('Error creating document:', err);
    return jsonError('Failed to create document', 500);
  }
}
