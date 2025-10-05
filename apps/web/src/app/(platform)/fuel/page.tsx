import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { server as airportServer } from '@/modules/core/airports';
import FuelProcurementClientPage from './ClientPage';
import { FuelProcurementProvider } from './contexts';

export default async function FuelProcurementPage() {
  const { dbUser, orgId, error } = await authenticateUser();
  if (error || !dbUser || !orgId) {
    return jsonError('Unauthorized', 401);
  }

  try {
    // Fetch initial data in parallel
    const [airports] = await Promise.all([airportServer.listAirportsByOrgId(dbUser.orgId)]);

    if (!airports) return jsonError('Failed to fetch airports', 500);

    return (
      <FuelProcurementProvider dbUser={dbUser} initialAirports={airports} hasServerData={true}>
        <FuelProcurementClientPage />
      </FuelProcurementProvider>
    );
  } catch (error) {
    return jsonError('Failed to load fuel procurement data', 500);
  }
}
