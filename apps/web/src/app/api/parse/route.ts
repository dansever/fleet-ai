import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { LlamaParseReader } from 'llama-cloud-services';
import { NextRequest, NextResponse } from 'next/server';

import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

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
    const path = file.name;

    // Turn the in-memory File into a temp file path
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tmpDir = await mkdtemp(join(tmpdir(), 'parse-'));
    const tmpPath = join(tmpDir, file.name || 'upload');

    // Write the file to the temp path
    await writeFile(tmpPath, buffer);

    // set up the llamaparse reader
    const reader = new LlamaParseReader({
      resultType: 'text',
    });

    // Parse by file path
    const data = await reader.loadData(tmpPath);

    // Cleanup temp file/folder
    await rm(tmpDir, { recursive: true, force: true });

    if (!data) return jsonError('Failed to parse document', 500);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to parse document', error);
    return jsonError('Failed to parse document', 500);
  }
}
