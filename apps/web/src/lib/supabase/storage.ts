import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function uploadFileToStorage({
  bucket,
  path,
  file,
  upsert = false,
}: {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}) {
  if (!bucket) {
    throw new Error('Bucket is required');
  }
  if (!path) {
    throw new Error('Path is required');
  }
  if (!file) {
    throw new Error('File is required');
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
