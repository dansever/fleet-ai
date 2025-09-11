import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import { server as orgServer } from '@/modules/core/organizations';
import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';

/**
 * POST /api/storage/upload - Upload a file to the storage
 * @param request
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

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

    // get the file extension and name
    const ext = (() => {
      const e = file.name.split('.').pop();
      return e ? e.toLowerCase() : 'bin';
    })();

    // add a UUID to avoid collisions
    const unique = crypto.randomUUID();

    // get the file name slug and path
    const fileNameSlug = slugify(file.name);
    const path = `${documentType}/${fileNameSlug}-${unique.slice(0, 4)}.${ext}`;

    console.log('++++ INSIDE API ROUTE ++++');
    console.log('Path:', path);
    console.log('Bucket:', bucket);

    // upload the file to the storage
    const uploadedFile = await uploadFileToStorage({ bucket, path, file });

    // return the uploaded file
    return NextResponse.json(uploadedFile);
  } catch (error) {
    console.error('Failed to upload file', error);
    return jsonError('Failed to upload file', 500);
  }
}
