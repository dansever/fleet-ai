'use client';

import { Organization, User } from '@/drizzle/types';
import { client as orgClient } from '@/modules/core/organizations';
import { client as userClient } from '@/modules/core/users';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';

type SettingsContextType = {
  user: User;
  org: Organization;
  loading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setOrg: (org: Organization) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
  initialUser,
  initialOrg,
  children,
}: {
  initialUser: User;
  initialOrg: Organization;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(initialUser);
  const [org, setOrg] = useState<Organization>(initialOrg);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      const updated = await userClient.updateUserById(updatedUser.id, updatedUser);
      setUser(updated);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
      setError(error as string);
    }
  }, []);

  const updateOrg = useCallback(async (updatedOrg: Organization) => {
    try {
      const updated = await orgClient.updateOrg(updatedOrg.id, updatedOrg);
      setOrg(updated);
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error('Failed to update organization');
      setError(error as string);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      org,
      loading,
      error,
      setUser,
      setOrg,
      setLoading,
      setError,
    }),
    [user, org, loading, error, setUser, setOrg, setLoading, setError],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within an SettingsProvider');
  }
  return context;
}
