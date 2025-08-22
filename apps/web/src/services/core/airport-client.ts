import { NewAirport, UpdateAirport } from '@/drizzle/types';
import { api } from '../api-client';

/**
 * Get all airports for the current organization
 * @returns Array of airports
 */
export async function getAirports() {
  console.log('getAirports');
  // const res = await api.get('/api/airports');
  // return res.data;
}

/**
 * Get an airport by its ID
 * @param id - The airport ID to retrieve
 * @returns The airport
 */
export async function getAirport(id: string) {
  const res = await api.get(`/api/airports?id=${id}`);
  return res.data;
}

/**
 * Create a new airport
 * @param airport - The airport data to create
 * @returns The created airport
 */
export async function createAirport(airport: NewAirport) {
  const res = await api.post('/api/airports', airport);
  return res.data;
}

/**
 * Update an airport by its ID
 * @param id - The airport ID to update
 * @param airport - The airport data to update
 * @returns The updated airport
 */
export async function updateAirport(id: string, airport: UpdateAirport) {
  const res = await api.put(`/api/airports?id=${id}`, airport);
  return res.data;
}

/**
 * Delete an airport by its ID
 * @param id - The airport ID to delete
 */
export async function deleteAirport(id: string) {
  await api.delete(`/api/airports?id=${id}`);
}
