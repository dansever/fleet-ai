import { getAirportsByOrgId } from '@/db/airports/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import AirportHubClientPage from './ClientPage';
import AirportHubProvider from './ContextProvider';

export default async function AirportHubPage() {
  const { dbUser, error } = await authorizeUser();
  if (error || !dbUser) {
    return jsonError('Unauthorized', 401);
  }
  if (!dbUser.orgId) {
    return jsonError('Organization not found', 404);
  }

  try {
    // Fetch initial data in parallel
    const [airports] = await Promise.all([getAirportsByOrgId(dbUser.orgId)]);
    if (!airports) return jsonError('Failed to fetch airports', 500);

    return (
      <AirportHubProvider dbUser={dbUser} initialAirports={airports} hasServerData={true}>
        <AirportHubClientPage />
      </AirportHubProvider>
    );
  } catch (error) {
    return jsonError('Failed to load fuel procurement data', 500);
  }
}
