import { authHeaders, withCtx } from '@/lib/ai/llamaCloud';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // streaming file upload

/**
 * Document Upload API for extraction
 * @param req request
 * @returns response
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append('upload_file', file, (file as any).name ?? 'upload.bin');

  const res = await fetch(withCtx('/api/v1/files'), {
    method: 'POST',
    headers: authHeaders(), // Authorization + Accept
    body: upstream,
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const json = await res.json();
  // returns File metadata including `id`
  return NextResponse.json(json);
}
