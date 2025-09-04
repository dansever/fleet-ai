import type { Organization, User } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { UserCreateInput, UserUpdateInput } from './users.types';

/**
 * Get a user by ID
 */
export async function getUser(id: User['id']): Promise<User> {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
}

/**
 * Get a user by Clerk user ID
 */
export async function getUserByClerkUserId(clerkUserId: User['clerkUserId']): Promise<User> {
  const res = await api.get(`/api/users?clerkUserId=${clerkUserId}`);
  return res.data;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  const res = await api.get('/api/users');
  return res.data;
}

/**
 * Get all users for an organization
 */
export async function listUsersByOrgId(orgId?: Organization['id']): Promise<User[]> {
  const url = orgId ? `/api/users?orgId=${orgId}` : '/api/users';
  const res = await api.get(url);
  return res.data;
}

/**
 * Create a new user
 */
export async function createUser(data: UserCreateInput): Promise<User> {
  const res = await api.post('/api/users', data);
  return res.data;
}

/**
 * Update an existing user
 */
export async function updateUserById(id: string, data: UserUpdateInput): Promise<User> {
  const res = await api.put(`/api/users/${id}`, data);
  return res.data;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
