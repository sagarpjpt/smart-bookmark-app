"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Form component for adding new bookmarks
 * Handles validation and submission
 */
interface BookmarkFormProps {
  onSubmit: (
    url: string,
    title: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

export function BookmarkForm({ onSubmit, loading }: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({});

  /**
   * Validates form inputs
   */
  const validateForm = () => {
    const newErrors: { url?: string; title?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else if (!/^https?:\/\/.+/.test(url)) {
      newErrors.url =
        "Please enter a valid URL starting with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await onSubmit(url.trim(), title.trim());

    if (result.success) {
      setUrl("");
      setTitle("");
      setErrors({});
    } else {
      // Could show a toast here, but for now we'll rely on the hook's error handling
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Bookmark</CardTitle>
        <CardDescription>
          Save a website to your personal collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bookmark title"
              error={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p
                id="title-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              URL
            </label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              error={!!errors.url}
              aria-describedby={errors.url ? "url-error" : undefined}
            />
            {errors.url && (
              <p
                id="url-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.url}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Add Bookmark
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
