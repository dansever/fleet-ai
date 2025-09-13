// src/modules/storage/storage.client.ts

/**
 * Contains the following functions:
 * - uploadFile
 * - listFiles
 * - getSignedUrl
 * - deleteFile
 */

import { api } from '@/services/api-client';

/**
 * Upload a file to the storage
 * @param file - the file to upload
 * @param documentType - the document type to upload the file to
 * @returns the file
 */
export async function uploadFile(file: File, documentType: string) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('documentType', documentType);
  const { data } = await api.post('/api/storage/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // includes bucket, path, signedUrl
}

/**
 * List files from the storage
 * @param documentType - the document type to list the files from
 * @returns the files
 */
export async function listFiles(documentType?: string) {
  const { data } = await api.get('/api/storage/list', { params: { documentType } });
  return data as Array<{ name: string; path: string; createdAt: string; size: number | null }>;
}

/**
 * Get a signed url for a file
 * @param path - the path to the file
 * @param expiresIn - the number of seconds to sign the url for
 * @returns the signed url
 */
export async function getSignedUrl(path: string, expiresIn = 60) {
  const { data } = await api.post('/api/storage/sign', { path, expiresIn });
  return data.signedUrl as string;
}

/**
 * Delete a file from the storage
 * @param path - the path to the file
 * @returns the file
 */
export async function deleteFile(path: string) {
  // TODO: implement server route that validates org prefix then calls storage.remove
  const { data } = await api.post('/api/storage/delete', { path });
  return data;
}
