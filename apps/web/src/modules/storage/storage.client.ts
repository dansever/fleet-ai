import { apiFetch, apiFormFetch } from '@/lib/core/fetcher';

/**
 * Get a file from the storage
 * @param path - the path to the file
 * @returns the file
 */
export async function getFileMetadata(path: string) {
  const res = await apiFetch<{ data: any }>(`/api/storage/get?path=${path}`);
  return res.data;
}

/**
 * Get a file from the storage
 * @param path - the path to the file
 * @returns the file
 */
export async function getFile(path: string) {
  const res = await apiFetch<{ File: File }>(`/api/storage/get?path=${path}`);
  return res.File;
}

/**
 * Upload a file to the storage
 * @param file - the file to upload
 * @param documentType - the type of document
 * @returns the file
 */
export async function uploadFile(file: File, documentType: string = 'contracts') {
  if (!file) {
    throw new Error('File is required');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  const res = await apiFormFetch('/api/storage/upload', formData);
  return res;
}

/**
 * Delete a file from the storage
 * @param path - the path to the file
 * @returns the file
 */
export async function deleteFile(path: string) {
  const res = await apiFetch<{ data: any }>(`/api/storage/delete?path=${path}`);
  return res.data;
}
