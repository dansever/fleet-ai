import type { Airport } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { AirportCreateInput, AirportUpdateInput } from './airports.types';

/**
 * Get an airport by ID
 */
export async function getAirportById(id: Airport['id']): Promise<Airport> {
  const res = await api.get(`/api/airports/${id}`);
  return res.data;
}

/**
 * Get all airports
 */
export async function listAirports(): Promise<Airport[]> {
  const res = await api.get('/api/airports');
  return res.data;
}

/**
 * Create a new airport
 */
export async function createAirport(data: AirportCreateInput): Promise<Airport> {
  const res = await api.post('/api/airports', data);
  return res.data;
}

/**
 * Update an existing airport
 */
export async function updateAirport(id: string, data: AirportUpdateInput): Promise<Airport> {
  const res = await api.put(`/api/airports/${id}`, data);
  return res.data;
}

/**
 * Delete an airport
 */
export async function deleteAirport(id: string): Promise<void> {
  await api.delete(`/api/airports/${id}`);
}
