import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { createClient } from '@/lib/supabase/client';
import { server as orgServer } from '@/modules/core/organizations';
import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
const supabase = createClient();

/**
 * POST /api/storage/upload - Upload a file to the storage
 * @param request
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // get the organization for the bucket
    const org = await orgServer.getOrgById(orgId);
    if (!org || !org.name) return jsonError('Organization not found', 404);
    const bucket = slugify(org.name, { lower: true });

    // get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return jsonError('No file uploaded', 400);

    // get the document type from the request
    const documentType = formData.get('documentType') as string;
    if (!documentType) return jsonError('No document type uploaded', 400);

    // get the file extension and name: "fileName.pdf" -> "pdf"
    const ext = (() => {
      const e = file.name.split('.').pop();
      return e ? e.toLowerCase() : 'bin';
    })();

    // get the file name without extension for slug: "fileName.pdf" -> "fileName"
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const fileNameSlug = slugify(fileNameWithoutExt, { lower: true });

    // add a UUID to avoid collisions
    const unique = crypto.randomUUID();

    // "contracts/fileName-1234.pdf"
    const path = `${documentType}/${fileNameSlug}-${unique.slice(0, 4)}.${ext}`;

    // upload the file to the storage
    const { data, error: supabaseError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (supabaseError) {
      console.error('Supabase storage error:', supabaseError);
      return jsonError(`Failed to upload file: ${supabaseError.message}`, 500);
    }
    // return the uploaded file data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to upload file', error);
    return jsonError('Failed to upload file', 500);
  }
}
