import { getAirportsByOrgId } from '@/db/airports/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/error';
import FuelProcurementClientPage from './ClientPage';
import FuelProcurementProvider from './ContextProvider';

export default async function FuelProcurementPage() {
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
      <FuelProcurementProvider dbUser={dbUser} initialAirports={airports} hasServerData={true}>
        <FuelProcurementClientPage />
      </FuelProcurementProvider>
    );
  } catch (error) {
    console.error('Error loading fuel procurement page:', error);
    return jsonError('Failed to load fuel procurement data', 500);
  }
}
