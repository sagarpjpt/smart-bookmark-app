import { Button } from "@/components/ui/button";
import { Bookmark } from "@/types";

/**
 * Individual bookmark item component
 * Displays bookmark details with delete action
 */
interface BookmarkItemProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

export function BookmarkItem({
  bookmark,
  onDelete,
  deleting,
}: BookmarkItemProps) {
  /**
   * Handles delete confirmation and execution
   */
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      onDelete(bookmark.id);
    }
  };

  return (
    <div className="flex items-start justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-foreground truncate">
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
          Added {new Date(bookmark.created_at).toLocaleDateString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
        className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
        aria-label={`Delete bookmark: ${bookmark.title}`}
      >
        {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
