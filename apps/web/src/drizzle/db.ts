// db/index.ts
import { env } from '@/lib/env/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema';

// Configure postgres client with proper connection pooling
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

// Cleanup function for graceful shutdown
export const closeDb = async () => {
  await client.end();
};

// Debug function to check connection pool status
export const getConnectionInfo = () => {
  return {
    totalConnections: client.options.max,
    // Note: postgres-js doesn't expose current active connections count
    // but you can monitor this in your PostgreSQL database directly
  };
};
