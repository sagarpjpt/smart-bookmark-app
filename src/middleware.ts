import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle Supabase session management
 * Runs on every request to refresh session if needed
 * Ensures auth state is consistent across all pages
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if it exists
  await supabase.auth.getSession();

  return res;
}

/**
 * Configure which routes this middleware runs on
 * Currently runs on all routes except static files
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
