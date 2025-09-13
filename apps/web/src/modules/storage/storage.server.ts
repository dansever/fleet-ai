'use server';
import 'server-only';

import { jsonError } from '@/lib/core/errors';
import { createClient } from '@/lib/supabase/server';
import { getBucketName } from '@/lib/supabase/storage-helpers';
import { server as orgServer } from '@/modules/core/organizations';
import { utils as storageUtils } from '@/modules/storage';

/**
 * Upload a file to storage
 */
export async function uploadFile(file: File, bucket: string, path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error('Supabase storage error:', error);
    return jsonError(`Failed to upload file: ${error.message}`, 500);
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
