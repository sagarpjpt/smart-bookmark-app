import { createClient } from '@/lib/supabase-server';
import { BookmarkService } from '@/lib/bookmark-service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/bookmarks/[id]
 * Deletes a specific bookmark
 * Only allows users to delete their own bookmarks
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookmarkId = params.id;
    const bookmarkService = new BookmarkService(supabase);
    
    await bookmarkService.deleteBookmark(bookmarkId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bookmarks/[id]
 * Updates a specific bookmark
 * Allows updating url and title
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const bookmarkId = params.id;
    
    const bookmarkService = new BookmarkService(supabase);
    const bookmark = await bookmarkService.updateBookmark(bookmarkId, user.id, body);

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}
