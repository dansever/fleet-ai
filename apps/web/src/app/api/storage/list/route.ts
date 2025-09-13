// src/app/api/storage/list/route.ts

import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as storageServer } from '@/modules/storage';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/storage/list
 * List files from the organization's storage bucket by document type
 * @param req - The request object.
 * Query parameters:
 * - documentType - The document type to list files from
 * @returns The files
 */
export async function GET(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get document type from request
    const url = new URL(req.url);
    const documentType = url.searchParams.get('documentType');
    if (!documentType) return jsonError('Document type is required', 400);

    // List files using server function
    const files = await storageServer.listFiles(orgId, documentType);

    return NextResponse.json(files);
  } catch (error) {
    console.error('Failed to list files:', error);
    return jsonError('Failed to list files', 500);
  }
}
