import { db } from '@/drizzle';
import { airportsTable } from '@/drizzle/schema/schema';
import { Airport, NewAirport, Organization, UpdateAirport } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

export const getAirportById = async (id: Airport['id']): Promise<Airport | null> => {
  const airport = await db.select().from(airportsTable).where(eq(airportsTable.id, id)).limit(1);
  return airport[0] || null;
};

export const getAirportsByOrgId = async (orgId: Organization['id']): Promise<Airport[]> => {
  const airports = await db.select().from(airportsTable).where(eq(airportsTable.orgId, orgId));
  return airports;
};

export const createAirport = async (airport: NewAirport): Promise<Airport> => {
  const [newAirport] = await db.insert(airportsTable).values(airport).returning();

  if (!newAirport) {
    throw new Error('Failed to create airport');
  }
  return newAirport;
};

export const updateAirport = async (
  id: Airport['id'],
  airport: UpdateAirport,
): Promise<Airport> => {
  const result = await db
    .update(airportsTable)
    .set(airport)
    .where(eq(airportsTable.id, id))
    .returning();
  return result[0];
};

export const deleteAirport = async (id: Airport['id']): Promise<void> => {
  await db.delete(airportsTable).where(eq(airportsTable.id, id));
};
