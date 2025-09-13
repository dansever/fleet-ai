'use server';
import 'server-only';

import { DocumentParentType, DocumentParentTypeEnum } from '@/drizzle/enums';
import { createClient } from '@/lib/supabase/server';
import { getBucketName } from '@/lib/supabase/storage-helpers';
import { server as orgServer } from '@/modules/core/organizations';
import { utils as storageUtils } from '@/modules/storage';
import crypto from 'crypto';
import slugify from 'slugify';

/**
 * Upload a file to storage - overloaded function
 */
export async function uploadFile(
  file: File,
  parentType: DocumentParentType,
  parentId: string,
): Promise<{ id: string; path: string; fullPath: string }>;
export async function uploadFile(file: File, bucket: string, path: string): Promise<any>;
export async function uploadFile(
  file: File,
  bucketOrParentType: string | DocumentParentType,
  pathOrParentId: string,
): Promise<any> {
  const supabase = await createClient();

  // Determine if this is the new signature (parentType, parentId) or old signature (bucket, path)
  const isNewSignature = DocumentParentTypeEnum.enumValues.includes(
    bucketOrParentType as DocumentParentType,
  );

  let bucket: string;
  let path: string;

  if (isNewSignature) {
    // New signature: (file, parentType, parentId)
    const parentType = bucketOrParentType as DocumentParentType;
    const parentId = pathOrParentId;

    // Get bucket name from current organization
    bucket = await storageUtils.getBucketName();

    // Generate path: parentType/filename-uuid.ext
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const fileNameSlug = slugify(base, { lower: true });
    const unique = crypto.randomUUID();
    path = `${parentType}/${fileNameSlug}-${unique}.${ext}`;

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

  // Get organization for bucket
  const org = await orgServer.getOrgById(orgId);
  if (!org) {
    throw new Error('Organization not found');
  }
  const bucket = getBucketName(org);

  // Validate path starts with bucket name
  if (!path.startsWith(`${bucket}/`)) {
    throw new Error('Forbidden - invalid path');
  }

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

  // Get organization for bucket
  const org = await orgServer.getOrgById(orgId);
  if (!org) {
    throw new Error('Organization not found');
  }
  const bucket = getBucketName(org);

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
