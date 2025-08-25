// db/index.ts
import { asError, DBUnavailableError } from '@/lib/core/errors';
import { env } from '@/lib/env/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema';

/**
 * Configure postgres client with proper connection pooling
 */
const client = postgres(env.DATABASE_URL, {
  // Connection pool configuration
  max: 20, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes

  // Connection reliability
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements (can cause issues in serverless)

  // Development/Production settings
  onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
  debug: process.env.NODE_ENV === 'development',

  // Connection monitoring (for debugging if needed)
  transform: {
    undefined: null,
  },
});

export const db = drizzle(client, { schema });

/**
 * Assert that the database is ready to be used.
 */
export async function assertDbReady() {
  try {
    // Cheap no-op query to validate the connection
    await client`select 1`;
  } catch (e) {
    const err = asError(e);
    console.error('DB connection failed:', err);
    // ensure Next receives a proper Error with name and message
    throw new DBUnavailableError(err);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
export const closeDb = async () => await client.end();

/**
 * Debug function to check connection pool status
 */
export const getConnectionInfo = () => ({ totalConnections: client.options.max });
