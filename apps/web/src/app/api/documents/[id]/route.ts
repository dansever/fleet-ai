import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as documentsServer } from '@/modules/documents';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/documents/[id]
 * Get a document by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get document id
    const { id } = await params;

    // Get document by id and authorize
    const document = await documentsServer.getDocumentById(id);
    if (!document) return jsonError('Document not found', 404);
    if (document.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Return document
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
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get data + document id and authorize
    const data = await request.json();
    const { id } = await params;

    // Prepare document data
    const documentData = { ...data, id };

    // Update document
    const document = await documentsServer.updateDocument(documentData);

    // Return document
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
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get document by id and authorize
    const { id } = await params;
    const document = await documentsServer.getDocumentById(id);
    if (!document) return jsonError('Document not found', 404);
    if (document.orgId !== orgId) return jsonError('Unauthorized', 401);

    // Delete document
    await documentsServer.deleteDocument(id);
    // TODO
    // Return success
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting document:', err);
    return jsonError('Failed to delete document', 500);
  }
}
