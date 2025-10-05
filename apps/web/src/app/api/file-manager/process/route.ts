// apps/web/src/app/api/files/process/route.ts

import { DocumentType } from '@/drizzle/enums';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { extraction } from '@/modules/file-manager';
import { NextRequest, NextResponse } from 'next/server';

const filesServer = extraction.server;

export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as DocumentType;
    const parentId = formData.get('parentId') as string;

    if (!file || !documentType || !parentId) {
      return jsonError('Missing required fields: file, documentType, parentId', 400);
    }

    // Process file using unified system
    const result = await filesServer.processFile({
      file,
      documentType,
      parentId,
      orgId,
      userId: dbUser.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('File processing error:', error);
    return jsonError('File processing failed', 500);
  }
}
