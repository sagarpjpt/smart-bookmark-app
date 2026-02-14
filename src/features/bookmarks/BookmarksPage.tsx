"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookmarkForm } from "./BookmarkForm";
import { BookmarkList } from "./BookmarkList";
import { BookmarkSearch } from "./BookmarkSearch";
import { Pagination } from "./Pagination";
import { Button } from "@/components/ui/button";

/**
 * Main bookmarks page component
 * Orchestrates all bookmark-related functionality
 */
export function BookmarksPage() {
  const {
    bookmarks,
    loading,
    error,
    page,
    totalPages,
    search,
    addBookmark,
    deleteBookmark,
    handleSearch,
    handlePageChange,
  } = useBookmarks();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  /**
   * Handles bookmark addition with loading state
   */
  const handleAddBookmark = async (url: string, title: string) => {
    setAdding(true);
    try {
      return await addBookmark(url, title);
    } finally {
      setAdding(false);
    }
  };

  /**
   * Handles bookmark deletion with loading state
   */
  const handleDeleteBookmark = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteBookmark(id);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              My Bookmarks
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your saved links
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Add Bookmark Form */}
        <div className="mb-8">
          <BookmarkForm onSubmit={handleAddBookmark} loading={adding} />
        </div>

        {/* Search */}
        <div className="mb-6">
          <BookmarkSearch value={search} onChange={handleSearch} />
        </div>

        {/* Bookmarks List */}
        <BookmarkList
          bookmarks={bookmarks}
          loading={loading}
          onDelete={handleDeleteBookmark}
          deletingId={deletingId || undefined}
        />

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
