// src/app/api/storage/upload/route.ts

import { getActiveClerkOrg, getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';

const supabase = createClient();
export const runtime = 'nodejs'; // Needed to avoid edge body limits

/**
 * POST /api/storage/upload - Upload a file to the storage
 * @param request - The request object.
 * Query parameters:
 * - documentType - The document type to upload the file to
 * @returns The uploaded file data
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const clerkOrg = await getActiveClerkOrg();
    if (!clerkOrg || !clerkOrg.slug) return jsonError('Clerk organization not found', 404);
    const bucket = clerkOrg.slug;

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return jsonError('No file uploaded', 400);

    // Get the document type from the request
    const documentType = String(formData.get('documentType') || '');
    if (!documentType) return jsonError('No document type uploaded', 400);

    // Create filename slug:
    // @Example: fileName.pdf -> fileName
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const fileNameSlug = slugify(base, { lower: true });

    // Final path: contracts/fileName-unique.pdf
    const unique = crypto.randomUUID();
    const path = `${documentType}/${fileNameSlug}-${unique}.${ext}`;

    // Upload the file to the storage
    const { data, error: supabaseError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (supabaseError) {
      console.error('Supabase storage error:', supabaseError);
      return jsonError(`Failed to upload file: ${supabaseError.message}`, 500);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to upload file', error);
    return jsonError('Failed to upload file', 500);
  }
}
