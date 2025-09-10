import { apiFormFetch } from '@/lib/core/fetcher';

export async function uploadFileToStorage(file: File, documentType: string = 'contracts') {
  if (!file) {
    throw new Error('File is required');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  const res = await apiFormFetch('/api/storage/upload', formData);
  return res;
}
