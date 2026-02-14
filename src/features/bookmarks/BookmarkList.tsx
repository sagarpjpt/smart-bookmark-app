import { BookmarkItem } from "./BookmarkItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "@/types";

/**
 * List component for displaying bookmarks
 * Handles loading states and empty states
 */
interface BookmarkListProps {
  bookmarks: Bookmark[];
  loading: boolean;
  onDelete: (id: string) => void;
  deletingId?: string;
}

export function BookmarkList({
  bookmarks,
  loading,
  onDelete,
  deletingId,
}: BookmarkListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">📚</div>
        <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
          No bookmarks yet
        </h3>
        <p className="text-muted-foreground">
          Add your first bookmark using the form above
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-lg border bg-card">
      {bookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={onDelete}
          deleting={deletingId === bookmark.id}
        />
      ))}
    </div>
  );
}
