"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

/**
 * Search component with debounced input
 * Prevents excessive API calls while typing
 */
interface BookmarkSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BookmarkSearch({
  value,
  onChange,
  placeholder = "Search bookmarks...",
}: BookmarkSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  /**
   * Sync local value with prop value
   */
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /**
   * Debounced search handler
   * Waits 300ms after user stops typing before triggering search
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <div className="w-full">
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full"
        aria-label="Search bookmarks"
      />
    </div>
  );
}
