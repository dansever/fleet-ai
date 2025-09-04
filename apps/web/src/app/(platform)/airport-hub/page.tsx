import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { server as airportServer } from '@/modules/core/airports';
import AirportHubClientPage from './ClientPage';
import AirportHubProvider from './ContextProvider';

export default async function AirportHubPage() {
  const { dbUser, orgId, error } = await authorizeUser();
  if (error || !dbUser || !orgId) {
    return jsonError('Unauthorized', 401);
  }

  // Fetch initial data in parallel
  const [airports] = await Promise.all([airportServer.listAirportsByOrgId(orgId)]);
  if (!airports) return jsonError('Failed to fetch airports', 500);

  return (
    <AirportHubProvider dbUser={dbUser} initialAirports={airports} hasServerData={true}>
      <AirportHubClientPage />
    </AirportHubProvider>
  );
}
