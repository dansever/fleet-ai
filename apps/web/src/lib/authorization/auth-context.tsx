/**
 * CLIENT-SIDE ONLY: Auth Context for client components
 *
 * USAGE:
 * - Server Components: Call `authenticateUser()` directly
 * - Client Components: Use `useAuth()` hook
 *
 * @example
 * // CLIENT component
 * 'use client';
 * export default function MyClientComponent() {
 *   const { dbUser, orgId } = useAuth();
 * }
 *
 * @example
 * // SERVER component
 * export default async function MyPage() {
 *   const { dbUser, orgId, error } = await authenticateUser();
 * }
 */
'use client';

import { User } from '@/drizzle/types';
import { createContext, ReactNode, useContext } from 'react';

interface AuthContextType {
  dbUser: User;
  orgId: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Wraps children with auth context
 * Should be used in the platform layout only
 */
export function AuthProvider({
  children,
  dbUser,
  orgId,
}: {
  children: ReactNode;
  dbUser: User;
  orgId: string;
}) {
  return <AuthContext.Provider value={{ dbUser, orgId }}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authenticated user and organization
 * Must be used within an AuthProvider (platform layout provides this)
 *
 * @throws Error if used outside AuthProvider
 * @returns {AuthContextType} Object containing dbUser and orgId
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
