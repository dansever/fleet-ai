import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as parseServer } from '@/modules/documents/parse';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // ensure Node APIs are available

export async function POST(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return jsonError('No file uploaded', 400);

    // Parse the document using server function
    const data = await parseServer.parseDocument(file);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to parse document', error);
    return jsonError('Failed to parse document', 500);
  }
}
