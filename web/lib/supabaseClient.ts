import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Creates a browser-safe client for client components.
export const supabaseBrowserClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Creates a service role client for server actions/API routes.
export const getSupabaseServiceClient = () => {
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE) return null;
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
