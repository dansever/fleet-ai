import { Organization } from '@/drizzle/types';
import slugify from 'slugify';

/**
 * Get the bucket name for an organization
 * @param org - The organization
 * @returns The bucket name
 */
export function getBucketName(org: Organization) {
  if (!org) {
    throw new Error('Organization is required');
  }
  if (!org.name) {
    throw new Error('Organization name is required');
  }
  const slug = slugify(org.name, { lower: true });
  // TODO: remove this after testing
  console.log(`getBucketName: ${org.name} --> ${slug}`);

  return slug;
}
