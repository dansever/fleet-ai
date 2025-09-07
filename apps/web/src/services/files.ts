import { createClient } from '@/utils/supabase/client';
import slugify from 'slugify';

const supabase = createClient();

export type Bucket = 'contracts' | 'invoices';

interface UploadFileProps {
  file: File;
  bucket: Bucket; // 'contracts' or 'invoices'
  orgName: string; // used as the folder
  upsert?: boolean; // false - won't overwrite existing file, true - will overwrite existing file
}

/** Uploads to: <bucket>/<org>/<MM-YYYY>/<filename> */
export async function uploadFile({ file, bucket, orgName, upsert = false }: UploadFileProps) {
  // helpers

  const ext = (() => {
    const e = file.name.split('.').pop();
    return e ? e.toLowerCase() : 'bin';
  })();

  const baseName = (() => {
    const raw = file.name;
    return raw.replace(/\.[^/.]+$/, ''); // strip extension
  })();

  const date = new Date();
  const safeOrg = slugify(orgName);
  const safeBase = slugify(baseName);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  const monthFolder = `${mm}-${yyyy}`;

  // add a UUID to avoid collisions unless you plan to use upsert: true
  const unique =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now();
  const path = `${safeOrg}/${monthFolder}/${safeBase}-${unique}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // optional: return a public URL if your bucket is public
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    bucket,
    path, // e.g. "acme-air/09-2025/invoice-123-<uuid>.pdf"
    publicUrl: pub.publicUrl, // usable only if the bucket or file is public
    meta: data,
  };
}
