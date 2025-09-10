import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as orgServer } from '@/modules/core/organizations';
import { auth } from '@clerk/nextjs/server';
import FileUploadClientPage from './ClientPage';

export default async function FileUploadPage() {
  const { dbUser, orgId, error } = await getAuthContext();

  if (error || !dbUser || !orgId) {
    return jsonError('Unauthorized', 401);
  }
  const { getToken } = await auth();
  const jwt = await getToken({ template: 'fleet-ai-jwt' });

  console.log('JWT: 🚀', jwt);

  const org = await orgServer.getOrgById(orgId);
  if (!org?.name) {
    return jsonError('Organization not found', 404);
  }

  return <FileUploadClientPage userId={dbUser.id} orgId={orgId} />;
}
