import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { getResolvedDatabaseUrl } from './src/lib/env/server';

export default defineConfig({
  schema: './src/drizzle/**/*.ts',
  out: './src/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: getResolvedDatabaseUrl() },
  strict: true,
});
