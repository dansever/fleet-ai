import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api-client';

// Create Supabase client
const supabase = createClient();

/**
 * Retrieve a file blob from the storage
 * @param path - the path to the file
 * @param bucket - the bucket to download the file from
 * @returns the file
 */
export async function retrieveFileBlob(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) {
    throw new Error(error.message);
  }
  return data as Blob;
}

/**
 * Download a file from the storage
 * @param path - the path to the file
 * @param bucket - the bucket to download the file from
 * @returns the file
 */
export async function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName ?? 'file';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * List files from the storage
 * @param bucket - the bucket to list the files from
 * @param folder - the folder to list the files from
 * @param search - the search query
 * @param limit - the limit of the files
 * @param offset - the offset of the files
 * @returns the files
 */
export async function listFilesByBucket(
  bucket: string,
  folder: string,
  search: string = '',
  limit: number = 100,
  offset: number = 0,
) {
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    search: search,
    limit: limit,
    offset: offset,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

/**
 * Upload a file to the storage
 * @param file - the file to upload
 * @param documentType - the document type to upload the file to
 * @returns the file
 */
export async function uploadFile(file: File, documentType: string) {
  // Create FormData to properly send the file
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const result = await api.post('/api/storage/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return result.data;
}

/**
 * Delete a file from the storage
 * @param path - the path to the file within the bucket
 * @returns the file
 */
export async function deleteFile(path: string) {
  const result = await api.delete('/api/storage/delete', {
    data: {
      path,
    },
  });
  return result.data;
}

/**
 * Get file counts for contracts and invoices folders in a bucket
 * @param bucketName - the name of the bucket
 * @returns object with contracts and invoices counts
 */
export async function getBucketFolderCounts(bucketName: string) {
  const result = await api.get(`/api/storage/buckets/${bucketName}?action=folder-counts`);
  return result.data;
}
