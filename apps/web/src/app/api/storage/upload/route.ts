import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { Bucket, uploadFile } from '@/services/files';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/storage/upload - Upload a file to the storage
 * @param request
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get the file and bucket from the request
    const file = (await request.formData()).get('file') as File;
    const bucket = (await request.formData()).get('bucket') as Bucket;

    // Validate the file and bucket
    if (!file) return jsonError('No file uploaded', 400);
    if (!bucket) return jsonError('No bucket uploaded', 400);

    // Upload the file to the storage
    const uploadedFile = await uploadFile({ file, bucket, orgName: orgId });
    return NextResponse.json(uploadedFile);
  } catch (error) {
    return jsonError('Failed to upload file', 500);
  }
}
