// src/modules/core/airports/airports.types.ts
/**
 * Airport types for form handling and API requests
 */

import type { NewAirport } from '@/drizzle/types';

/**
 * For creating airports from forms - excludes server-managed fields
 */
export type AirportCreateInput = Omit<NewAirport, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * For updating airports from forms - all fields optional
 */
export type AirportUpdateInput = Partial<AirportCreateInput>;
