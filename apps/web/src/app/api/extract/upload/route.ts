import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Required for streaming file upload

/**
 * This API is used to upload a file for extraction processing
 * @param req request with multipart/form-data containing 'file'
 * @returns the uploaded file metadata including ID
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'A file is required in form data' }, { status: 400 });
    }

    // Prepare upstream form data for LlamaCloud API
    const upstream = new FormData();
    upstream.append('upload_file', file, (file as any).name ?? 'upload.bin');

    const res = await fetch(withCtx('/api/v1/files'), {
      method: 'POST',
      headers: authHeaders(),
      body: upstream,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const fileMetadata = await res.json();
    return NextResponse.json(fileMetadata);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
