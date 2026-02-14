import { SupabaseClient } from '@supabase/supabase-js';
import { Bookmark, BookmarkInput, PaginatedResponse, PaginationParams } from '@/types';

/**
 * Service layer for bookmark operations
 * Handles all database interactions related to bookmarks
 * Separates business logic from API routes and components
 */
export class BookmarkService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Retrieves paginated bookmarks for the current user
   * Supports search filtering and pagination
   * Returns bookmarks in descending order by creation date
   */
  async getBookmarks(
    userId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Bookmark>> {
    const { page = 1, limit = 10, search = '' } = params;
    const offset = (page - 1) * limit;

    // Build query with user filter
    let query = this.supabase
      .from('bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,url.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Creates a new bookmark for the user
   * Validates that URL and title are provided
   * Returns the created bookmark object
   */
  async createBookmark(userId: string, input: BookmarkInput): Promise<Bookmark> {
    const { url, title } = input;

    if (!url || !title) {
      throw new Error('URL and title are required');
    }

    const { data, error } = await this.supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        url,
        title,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create bookmark: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletes a bookmark by ID
   * Ensures user can only delete their own bookmarks
   * Throws error if bookmark doesn't exist or belongs to another user
   */
  async deleteBookmark(bookmarkId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete bookmark: ${error.message}`);
    }
  }

  /**
   * Updates an existing bookmark
   * Only allows updating title and URL
   * Ensures user owns the bookmark before updating
   */
  async updateBookmark(
    bookmarkId: string,
    userId: string,
    input: Partial<BookmarkInput>
  ): Promise<Bookmark> {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookmarkId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update bookmark: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves a single bookmark by ID
   * Validates ownership before returning
   */
  async getBookmark(bookmarkId: string, userId: string): Promise<Bookmark | null> {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select('*')
      .eq('id', bookmarkId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}
