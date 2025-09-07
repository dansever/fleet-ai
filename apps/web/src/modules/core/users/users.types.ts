// src/modules/core/users/users.types.ts
/**
 * User types for form handling and API requests
 */

import type { NewUser } from '@/drizzle/types';

/**
 * For creating users from forms - excludes server-managed fields
 */
export type UserCreateInput = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * For updating users from forms - all fields optional
 */
export type UserUpdateInput = Partial<UserCreateInput>;
