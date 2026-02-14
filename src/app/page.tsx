import { createClient } from "@/lib/supabase-server";
import LoginButton from "@/components/LoginButton";
import { BookmarksPage } from "@/features/bookmarks";

/**
 * Main page component
 * Checks authentication status on server side
 * Renders login or bookmark list based on auth state
 */
export default async function Home() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Show login page if not authenticated
  if (!user) {
    return <LoginButton />;
  }

  // Show bookmark manager if authenticated
  return <BookmarksPage />;
}
