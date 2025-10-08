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
    BACKEND_URL: z.string().url().default('http://localhost:8001'),
    CORS_ALLOWED_ORIGINS: z
      .string()
      .default('http://localhost:3000,http://localhost:8000,http://localhost:8001'),

    NODE_ENV: z.enum(['development', 'production']).default('development'),

    // LangGraph
    LANGGRAPH_DEPLOYMENT_URL: z.string().url().default('http://localhost:8000'),

    // LangSmith
    LANGSMITH_API_KEY: z.string().min(1),

    // OpenAI
    OPENAI_API_KEY: z.string().min(1),
    ACTIVE_OPENAI_MODEL: z.string().min(1),

    // Llama Cloud
    LLAMA_CLOUD_API_KEY: z.string().min(1),
    LLAMA_EXTRACT_PROJECT_ID: z.string().min(1),
    LLAMA_ORGANIZATION_ID: z.string().min(1),

    // CopilotKit
    COPILOTKIT_API_KEY: z.string().min(1),

    // Tavily
    TAVILY_API_KEY: z.string().min(1),

    // Weather API
    WEATHER_API_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});

// Single resolved DB URL for Node code
export function getResolvedDatabaseUrl(): string {
  // CI/Prod host-injected first
  if (serverEnv.DATABASE_URL) return serverEnv.DATABASE_URL;

  // Local toggle
  const local = serverEnv.DATABASE_URL_LOCAL;
  const supa = serverEnv.DATABASE_URL_SUPABASE;
  // Local toggle
  if (!local || !supa) {
    throw new Error(
      'DATABASE_URL not set. For local dev set DATABASE_URL_LOCAL and DATABASE_URL_SUPABASE in .env.local',
    );
  }
  // Local toggle
  return serverEnv.DB_TARGET === 'supabase' ? supa : local;
}
