import { apiFormFetch } from '@/lib/core/fetcher';

export async function uploadFile(file: File, bucket: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);

  const res = await apiFormFetch<{ data: unknown }>('/api/storage/upload', formData);
  return res;
}
