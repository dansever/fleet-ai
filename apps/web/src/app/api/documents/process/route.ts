import { DocumentParentType } from '@/drizzle/enums';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { processDocument } from '@/modules/documents/orchastration/orchastrator.client';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = {
  params: Promise<{ parentType: DocumentParentType; parentId: string }>;
};

/**
 * POST /api/documents/process
 * Process a document - from upload to complete
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return jsonError('No file uploaded', 400);

    // Get the parent type and id from the request
    const parentType = formData.get('parentType') as DocumentParentType;
    const parentId = formData.get('parentId') as string;
    if (!parentType || !parentId) return jsonError('No parent type or id uploaded', 400);

    // Process the document
    const document = await processDocument(file, { parentId, parentType });

    // Return the document
    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to process document', error);
    return jsonError('Failed to process document', 500);
  }
}
