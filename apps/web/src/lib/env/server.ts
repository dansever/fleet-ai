// src/lib/env/server.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  server: {
    // Deploy time single URL, optional in local
    DATABASE_URL: z.string().url().optional(),

    // Local switching
    DATABASE_URL_LOCAL: z.string().url().optional(),
    DATABASE_URL_SUPABASE: z.string().url().optional(),
    DB_TARGET: z.enum(['local', 'supabase']).default('local'),

    // Clerk server
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),

    // Backend server config
    BACKEND_URL: z.string().url().default('http://localhost:8000'),
    CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8000'),

    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  experimental__runtimeEnv: process.env,
});

// Single resolved DB URL for Node code
export function getResolvedDatabaseUrl(): string {
  if (serverEnv.DATABASE_URL) return serverEnv.DATABASE_URL;

  const local = serverEnv.DATABASE_URL_LOCAL;
  const supa = serverEnv.DATABASE_URL_SUPABASE;

  if (!local || !supa) {
    throw new Error(
      'DATABASE_URL not set. For local dev set DATABASE_URL_LOCAL and DATABASE_URL_SUPABASE in .env.local',
    );
  }
  return serverEnv.DB_TARGET === 'supabase' ? supa : local;
}
