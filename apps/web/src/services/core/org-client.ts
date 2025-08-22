import type {
  NewOrganization,
  Organization,
  UpdateOrganization,
} from '@/drizzle/types';
import { api } from '../api-client';

/**
 * Get an organization by ID
 */
export async function getOrgById(
  id: Organization['id'],
): Promise<Organization> {
  const res = await api.get(`/api/orgs?id=${id}`);
  return res.data;
}

/**
 * Get an organization by Clerk organization ID
 */
export async function getOrgByClerkOrgId(
  clerkOrgId: string,
): Promise<Organization> {
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
export async function createOrganization(
  data: NewOrganization,
): Promise<Organization> {
  const res = await api.post('/api/orgs', data);
  return res.data;
}

/**
 * Update an existing organization
 */
export async function updateOrganizationById(
  id: string,
  data: UpdateOrganization,
): Promise<Organization> {
  const res = await api.put(`/api/orgs?id=${id}`, data);
  return res.data;
}

/**
 * Delete an organization
 */
export async function deleteOrganizationById(id: string): Promise<void> {
  await api.delete(`/api/orgs?id=${id}`);
}
