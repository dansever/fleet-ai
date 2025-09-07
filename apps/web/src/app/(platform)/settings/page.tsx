import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { server as orgServer } from '@/modules/core/organizations';
import { server as userServer } from '@/modules/core/users';
import SettingsClientPage from './ClientPage';
import { SettingsProvider } from './ContextProvider';

export default async function SettingsPage() {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) {
    return <div>Error: {error}</div>;
  }

  const user = await userServer.getUserById(dbUser.id);
  if (!user) {
    return <div>Error: User not found</div>;
  }

  const org = await orgServer.getOrgById(orgId);
  if (!org) {
    return <div>Error: Organization not found</div>;
  }

  return (
    <SettingsProvider initialUser={user} initialOrg={org}>
      <SettingsClientPage />
    </SettingsProvider>
  );
}
