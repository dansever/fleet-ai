// src/hooks/use-clerk-provider-data.ts
import { useUser } from '@clerk/nextjs';

export function useClerkProviderData(provider: string, all: boolean = false) {
  const { user } = useUser();

  if (!user) return null;
  if (all) {
    return user.externalAccounts;
  } else {
    return user.externalAccounts?.find((acc) => acc.provider === provider) || null;
  }
}
