// src/app/api/storage/list/route.ts

import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { createClient } from '@/lib/supabase/server';
import { getBucketName } from '@/lib/supabase/storage-helpers';
import { server as orgServer } from '@/modules/core/organizations';
import { NextRequest, NextResponse } from 'next/server';

const supabase = await createClient();

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

    // Get organization for bucket
    const org = await orgServer.getOrgById(orgId);
    if (!org) return jsonError('Organization not found', 404);
    const bucket = getBucketName(org);

    // Get document type from request
    const url = new URL(req.url);
    const documentType = url.searchParams.get('documentType');
    if (!documentType) return jsonError('Document type is required', 400);

    // List files from storage
    const { data, error: err } = await supabase.storage.from(bucket).list(documentType, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (err) return jsonError(err.message, 500);
    if (!data) return jsonError('No files found', 404);

    return NextResponse.json(
      (data || []).map((obj) => ({
        name: obj.name,
        path: `${documentType}/${obj.name}`,
        createdAt: obj.created_at,
        updatedAt: obj.updated_at,
        size: obj.metadata?.size ?? null,
      })),
    );
  } catch (error) {
    console.error('Failed to list files:', error);
    return jsonError('Failed to list files', 500);
  }
}
