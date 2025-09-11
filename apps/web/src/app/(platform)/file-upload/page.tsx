import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as orgServer } from '@/modules/core/organizations';
import FileUploadClientPage from './ClientPage';

export default async function FileUploadPage() {
  const { dbUser, orgId, error } = await getAuthContext();

  if (error || !dbUser || !orgId) {
    return jsonError('Unauthorized', 401);
  }

  const org = await orgServer.getOrgById(orgId);
  if (!org || !org.name) {
    return jsonError('Organization not found', 404);
  }

  return <FileUploadClientPage userId={dbUser.id} orgId={orgId} />;
}
