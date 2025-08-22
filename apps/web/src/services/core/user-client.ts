import type { NewUser, Organization, UpdateUser, User } from '@/drizzle/types';
import { api } from '../api-client';

/**
 * Get a user by ID
 */
export async function getUserById(id: User['id']): Promise<User> {
  const res = await api.get(`/api/users?id=${id}`);
  return res.data;
}

/**
 * Get a user by Clerk user ID
 */
export async function getUserByClerkUserId(
  clerkUserId: User['clerkUserId'],
): Promise<User> {
  const res = await api.get(`/api/users?clerkUserId=${clerkUserId}`);
  return res.data;
}

/**
 * Get all users for an organization
 */
export async function getOrgUsers(orgId?: Organization['id']): Promise<User[]> {
  const url = orgId ? `/api/users?orgId=${orgId}` : '/api/users';
  const res = await api.get(url);
  return res.data;
}

/**
 * Create a new user
 */
export async function createUser(data: NewUser): Promise<User> {
  const res = await api.post('/api/users', data);
  return res.data;
}

/**
 * Update an existing user
 */
export async function updateUserById(
  id: string,
  data: UpdateUser,
): Promise<User> {
  const res = await api.put(`/api/users?id=${id}`, data);
  return res.data;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users?id=${id}`);
}

/**
 * Get current user (convenience method)
 */
export async function getCurrentUser(): Promise<User> {
  // This would typically use the current user's ID from auth context
  // For now, this is a placeholder - you'd need to implement based on your auth system
  throw new Error(
    "getCurrentUser not implemented - use getUserById with current user's ID",
  );
}
