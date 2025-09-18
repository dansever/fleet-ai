import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer } from '@/modules/ai/extract';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Required for streaming file upload

/**
 * This API is used to upload a file for extraction processing
 * @param req request with multipart/form-data containing 'file'
 * @returns the uploaded file metadata including ID
 */
export async function POST(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required in form data' }, { status: 400 });
    }

    // Upload file using server function
    const fileMetadata = await extractServer.uploadFileForExtraction(file);
    return NextResponse.json(fileMetadata);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
