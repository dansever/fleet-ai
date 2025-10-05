import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { documents, storage } from '@/modules/file-manager';
import { NextRequest, NextResponse } from 'next/server';

const documentsServer = documents.server;
const storageServer = storage.server;

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Get a document by ID
 * @param request - The request object
 * @param params - Route parameters containing the document ID
 * @returns The document
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get document ID from params
    const { id } = await params;
    if (!id) {
      return jsonError('Document ID is required', 400);
    }

    // Get document by ID
    const document = await documentsServer.getDocumentById(id);
    if (!document) {
      return jsonError('Document not found', 404);
    }

    // Return document
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return jsonError('Failed to fetch document', 500);
  }
}

/**
 * Update a document by ID
 * @param request - The request object
 * @param params - Route parameters containing the document ID
 * @returns The updated document
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get document ID from params
    const { id } = await params;
    if (!id) {
      return jsonError('Document ID is required', 400);
    }

    // Get request body
    const data = await request.json();

    // Update document
    const document = await documentsServer.updateDocument(id, data);

    // Return updated document
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return jsonError('Failed to update document', 500);
  }
}

/**
 * Delete a document by ID
 * @param request - The request object
 * @param params - Route parameters containing the document ID
 * @returns Success response
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get document ID from params
    const { id } = await params;
    if (!id) {
      return jsonError('Document ID is required', 400);
    }

    // Get the document
    const document = await documentsServer.getDocumentById(id);
    if (!document) {
      return jsonError('Document not found', 404);
    }
    if (!document.storagePath) {
      return jsonError('Document storage path not found', 404);
    }
    if (document.orgId !== orgId) {
      return jsonError('Unauthorized', 401);
    }

    // Delete document record
    await documentsServer.deleteDocument(id);

    // Delete file from storage
    await storageServer.deleteFile(document.storagePath);

    // Return response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return jsonError('Failed to delete document', 500);
  }
}
