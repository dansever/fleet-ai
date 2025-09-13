import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import 'dotenv/config';
import { LlamaParseReader } from 'llama-cloud-services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return jsonError('No file uploaded', 400);
    const path = file.name;

    // Get the parser name from the request
    const parserName = formData.get('parserName') as string;
    if (!parserName) return jsonError('No parser name uploaded', 400);

    // set up the llamaparse reader
    const reader = new LlamaParseReader({ resultType: 'markdown' });

    // parse the document
    const content = await reader.loadData(path);
    if (!content) return jsonError('Failed to parse document', 500);

    return NextResponse.json(content);
  } catch (error) {
    console.error('Failed to parse document', error);
    return jsonError('Failed to parse document', 500);
  }
}
