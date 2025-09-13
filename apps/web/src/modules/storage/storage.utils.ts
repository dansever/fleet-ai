import { getActiveClerkOrg } from '@/lib/authorization/get-auth-context';
import slugify from 'slugify';

/**
 * Generate a bucket name for the active clerk organization
 * @returns The bucket name
 */
export async function getBucketName() {
  // Get the clerk organization
  const clerkOrg = await getActiveClerkOrg();
  if (!clerkOrg || !clerkOrg.slug) {
    throw new Error('Clerk organization not found');
  }
  const bucket = clerkOrg.slug;
  return bucket;
}

/**
 * Generate a storage path
 * @param fileName
 * @param documentType
 * @returns
 */
export async function generateStoragePath(fileName: string, documentType: string) {
  const ext = (fileName.split('.').pop() || 'bin').toLowerCase();
  const base = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  const fileNameSlug = slugify(base, { lower: true });
  const unique = crypto.randomUUID();
  const path = `${documentType}/${fileNameSlug}-${unique}.${ext}`;
  return path;
}
