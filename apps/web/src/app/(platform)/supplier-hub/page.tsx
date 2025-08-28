import { getRfqsByOrgAndDirection } from '@/db/rfqs/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import SupplierHubClientPage from './ClientPage';
import { SupplierHubContextProvider } from './ContextProvider';

export default async function SupplierHubPage() {
  const { dbUser, error } = await authorizeUser();
  if (error || !dbUser) return jsonError('Unauthorized', 401);

  const orgId = dbUser.orgId;
  if (!orgId) return jsonError('User has no organization', 403);

  const incomingRfqs = await getRfqsByOrgAndDirection(orgId, 'received');

  return (
    <SupplierHubContextProvider orgId={orgId} initialRfqs={incomingRfqs} hasServerData={true}>
      <SupplierHubClientPage />
    </SupplierHubContextProvider>
  );
}
