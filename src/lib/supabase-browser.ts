import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates and returns a Supabase client for use in client components
 * This client automatically handles session management and auth state
 * Uses environment variables for configuration
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};