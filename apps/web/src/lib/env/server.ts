import 'dotenv/config';

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    // Database
    DATABASE_URL: z.string().url(),

    // Clerk Authentication
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SECRET: z.string(),

    // API Configuration
    BACKEND_URL: z.string().url().optional(),

    // Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  experimental__runtimeEnv: process.env,
});
