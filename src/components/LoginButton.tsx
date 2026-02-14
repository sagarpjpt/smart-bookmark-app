'use client';

import { createClient } from '@/lib/supabase-browser';

/**
 * Login component that handles Google OAuth authentication
 * Redirects to OAuth flow when user clicks sign in
 * Uses Supabase Auth for session management
 */
export default function LoginButton() {
  const supabase = createClient();

  /**
   * Initiates Google OAuth login flow
   * Redirects user to Google consent screen
   * On success, returns to callback URL
   */
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Smart Bookmark Manager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Save and organize your bookmarks
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
