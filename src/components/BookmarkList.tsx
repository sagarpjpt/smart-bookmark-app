"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Bookmark } from "@/types";

/**
 * Main bookmark list component
 * Displays user bookmarks with search, pagination, and real-time updates
 * Handles create, delete operations and syncs across tabs
 */
export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const supabase = createClient();

  /**
   * Fetches bookmarks from API
   * Includes pagination and search parameters
   * Called on mount and when filters change
   */
  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      const response = await fetch(`/api/bookmarks?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBookmarks(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sets up real-time subscription for bookmark changes
   * Listens to INSERT and DELETE events on bookmarks table
   * Automatically refreshes list when data changes in another tab
   */
  useEffect(() => {
    fetchBookmarks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          fetchBookmarks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, search]);

  /**
   * Creates a new bookmark
   * Validates inputs before submitting
   * Clears form on success
   */
  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUrl || !newTitle) {
      alert("Please fill in both URL and title");
      return;
    }

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: newUrl,
          title: newTitle,
        }),
      });

      if (response.ok) {
        setNewUrl("");
        setNewTitle("");
        fetchBookmarks();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add bookmark");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark");
    }
  };

  /**
   * Deletes a bookmark by ID
   * Confirms before deletion
   * Refreshes list on success
   */
  const handleDeleteBookmark = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBookmarks();
      } else {
        alert("Failed to delete bookmark");
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert("Failed to delete bookmark");
    }
  };

  /**
   * Handles user logout
   * Signs out from Supabase and reloads page
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  /**
   * Debounced search handler
   * Resets to page 1 when search term changes
   */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Bookmarks</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>

        {/* Add bookmark form */}
        <div className="bg-card rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Bookmark</h2>
          <form onSubmit={handleAddBookmark} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter bookmark title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Add Bookmark
            </button>
          </form>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Bookmarks list */}
        <div className="bg-card rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No bookmarks found. Add your first bookmark above!
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.id} className="p-4 hover:bg-muted">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-foreground">
                        {bookmark.title}
                      </h3>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {bookmark.url}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added{" "}
                        {new Date(bookmark.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="ml-4 px-3 py-1 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
