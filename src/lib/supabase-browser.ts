import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Creates and returns a Supabase client for use in client components
 * This client automatically handles session management and auth state
 * Uses environment variables for configuration
 */
export const createClient = () => {
  return createClientComponentClient();
};
