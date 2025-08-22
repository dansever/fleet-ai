import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    // Database
    DATABASE_URL: z.string().url('Invalid database URL'),

    // Clerk Authentication
    CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),
    CLERK_WEBHOOK_SECRET: z.string().min(1, 'Clerk webhook secret is required'),

    // API Configuration
    BACKEND_URL: z.string().url('Invalid backend URL').default('http://localhost:8000'),
    CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8000'),

    // Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  experimental__runtimeEnv: process.env,
});
