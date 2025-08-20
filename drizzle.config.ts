import 'dotenv/config';

import type { Config } from 'drizzle-kit';
import { env } from './apps/web/src/lib/env/server';

export default {
  schema: './apps/web/src/drizzle/schema/schema.ts',
  out: './apps/web/src/drizzle/migrations',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
