import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as documentsServer } from '@/modules/documents';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/documents/[id]
 * Get a document by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

  try {
    const document = await documentsServer.getDocumentById(params.id);
    return NextResponse.json(document);
  } catch (err) {
    console.error('Error fetching document:', err);
    return jsonError('Document not found', 404);
  }
}

/**
 * PUT /api/documents/[id]
 * Update a document
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

  try {
    const data = await request.json();
    const documentData = { ...data, id: params.id };
    const document = await documentsServer.updateDocument(documentData);
    return NextResponse.json(document);
  } catch (err) {
    console.error('Error updating document:', err);
    return jsonError('Failed to update document', 500);
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

  try {
    await documentsServer.deleteDocument(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting document:', err);
    return jsonError('Failed to delete document', 500);
  }
}
