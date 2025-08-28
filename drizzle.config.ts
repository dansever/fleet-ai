import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { getResolvedDatabaseUrl } from './apps/web/src/lib/env/server';

export default defineConfig({
  schema: './db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: getResolvedDatabaseUrl() },
  strict: true,
});
