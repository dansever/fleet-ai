// db/index.ts
import { getResolvedDatabaseUrl, serverEnv } from '@/lib/env/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  __pg?: Sql;
  __db?: ReturnType<typeof drizzle<typeof schema>>;
};

function createPgClient() {
  const url = getResolvedDatabaseUrl();
  const isDev = serverEnv.NODE_ENV === 'development';

  return postgres(url, {
    max: 20,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
    prepare: false, // required for Supabase pgbouncer and safer in serverless
    onnotice: isDev ? console.log : undefined,
    debug: isDev,
    transform: { undefined: null },
  });
}

export const client: Sql = globalForDb.__pg || (globalForDb.__pg = createPgClient());
export const db = globalForDb.__db || (globalForDb.__db = drizzle(client, { schema }));

export async function assertDbReady() {
  await client`select 1`;
}
export async function closeDb() {
  await client.end({ timeout: 5 });
}
export function getConnectionInfo() {
  return { totalConnections: client.options.max };
}
