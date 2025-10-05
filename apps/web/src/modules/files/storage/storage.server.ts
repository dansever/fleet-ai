'use server';
import 'server-only';

import { DocumentType, DocumentTypeEnum } from '@/drizzle/enums';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import * as storageUtils from './storage.utils';

/**
 * Upload a file to storage - overloaded function
 */
export async function uploadFile(
  file: File,
  parentType: DocumentType,
  parentId: string,
): Promise<{ id: string; path: string; fullPath: string }>;
export async function uploadFile(file: File, bucket: string, path: string): Promise<any>;
export async function uploadFile(
  file: File,
  bucketOrParentType: string | DocumentType,
  pathOrParentId: string,
): Promise<any> {
  const supabase = await createClient();

  // Determine if this is the new signature (parentType, parentId) or old signature (bucket, path)
  const isNewSignature = DocumentTypeEnum.enumValues.includes(bucketOrParentType as DocumentType);

  let bucket: string;
  let path: string;

  if (isNewSignature) {
    // New signature: (file, parentType, parentId)
    const parentType = bucketOrParentType as DocumentType;
    const parentId = pathOrParentId;

    // Get bucket name from current organization
    bucket = await storageUtils.getBucketName();

    // Generate path using utility function
    path = await storageUtils.generateStoragePath(file.name, parentType + 's');

    console.log(`📁 Uploading to bucket: ${bucket}, path: ${path}`);
  } else {
    // Old signature: (file, bucket, path)
    bucket = bucketOrParentType;
    path = pathOrParentId;
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error('Supabase storage error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  if (isNewSignature) {
    // Return structured data for new signature
    return {
      id: data.id || crypto.randomUUID(),
      path: data.path,
      fullPath: data.fullPath,
    };
  }

  return data;
}

/**
 * Create a signed URL for a file
 */
export async function createSignedUrl(orgId: string, path: string, expiresIn: number = 60) {
  const supabase = await createClient();
  const bucket = await storageUtils.getBucketName();

  // Sign the file
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to sign file: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from signing operation');
  }

  return data;
}

/**
 * List files from storage bucket by document type
 */
export async function listFiles(orgId: string, documentType: string) {
  const supabase = await createClient();
  const bucket = await storageUtils.getBucketName();

  // List files from storage
  const { data, error } = await supabase.storage.from(bucket).list(documentType, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  if (!data) {
    throw new Error('No files found');
  }

  return (data || []).map((obj) => ({
    name: obj.name,
    path: `${documentType}/${obj.name}`,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
    size: obj.metadata?.size ?? null,
  }));
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string) {
  const supabase = await createClient();

  const bucket = await storageUtils.getBucketName();

  // Delete the file from storage
  const { data, error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  console.log('✅ Deleted file from storage', path);
  return {
    data,
    message: 'File deleted successfully',
  };
}

/**
 * Download a file from storage
 */
export async function downloadFile(path: string) {
  const supabase = await createClient();
  const bucket = await storageUtils.getBucketName();
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return data;
}
