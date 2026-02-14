import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Bookmark } from '@/types';

/**
 * Custom hook for managing bookmarks
 * Handles fetching, adding, deleting, and real-time updates
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  /**
   * Fetches bookmarks from API with pagination and search
   */
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
      });

      const response = await fetch(`/api/bookmarks?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBookmarks(data.data);
        setTotalPages(data.totalPages);
      } else {
        setError(data.error || 'Failed to fetch bookmarks');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  /**
   * Adds a new bookmark
   */
  const addBookmark = useCallback(async (url: string, title: string) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, title }),
      });

      if (response.ok) {
        await fetchBookmarks(); // Refresh the list
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to add bookmark' };
      }
    } catch (err) {
      console.error('Error adding bookmark:', err);
      return { success: false, error: 'Network error occurred' };
    }
  }, [fetchBookmarks]);

  /**
   * Deletes a bookmark by ID
   */
  const deleteBookmark = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBookmarks(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: 'Failed to delete bookmark' };
      }
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      return { success: false, error: 'Network error occurred' };
    }
  }, [fetchBookmarks]);

  /**
   * Handles search with debouncing
   */
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  }, []);

  /**
   * Handles page changes
   */
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  /**
   * Sets up real-time subscription for bookmark changes
   */
  useEffect(() => {
    fetchBookmarks();

    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookmarks, supabase]);

  return {
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
  };
}