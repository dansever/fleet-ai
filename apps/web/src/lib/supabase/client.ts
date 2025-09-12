// lib/supabase/client.ts
// Browser-side Supabase client (uses anon key, no auth headers)

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
