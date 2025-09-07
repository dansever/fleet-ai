import type { Organization } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { OrganizationCreateInput, OrganizationUpdateInput } from './organizations.types';

/**
 * Get an organization by ID
 */
export async function getOrgById(id: Organization['id']): Promise<Organization> {
  const res = await api.get(`/api/orgs?id=${id}`);
  return res.data;
}

/**
 * Get an organization by Clerk organization ID
 */
export async function getOrgByClerkOrgId(clerkOrgId: string): Promise<Organization> {
  const res = await api.get(`/api/orgs?clerkOrgId=${clerkOrgId}`);
  return res.data;
}

/**
 * Get current user's organization
 */
export async function getCurrentOrg(): Promise<Organization> {
  const res = await api.get('/api/orgs');
  return res.data;
}

/**
 * Create a new organization
 */
export async function createOrg(data: OrganizationCreateInput): Promise<Organization> {
  const res = await api.post('/api/orgs', data);
  return res.data;
}

/**
 * Update an existing organization
 */
export async function updateOrg(id: string, data: OrganizationUpdateInput): Promise<Organization> {
  const res = await api.put(`/api/orgs?id=${id}`, data);
  return res.data;
}

/**
 * Delete an organization
 */
export async function deleteOrg(id: string): Promise<void> {
  await api.delete(`/api/orgs?id=${id}`);
}
