// lib/supabase/clerk-server.ts
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export function createClerkSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        const { getToken } = await auth();
        return getToken() ?? null; // Clerk session JWT
      },
    },
  );
}
