// lib/supabase/clerk-server.ts
// Clerk-integrated server-side client (injects Clerk JWT like your snippet)

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function createClerkSupabaseServer() {
  const { getToken } = await auth();
  const token = await getToken({ template: 'fleet-ai-jwt' });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    },
  );
}
