/**
 * Application-wide constants
 * Centralizes configuration values for easy maintenance
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const VALIDATION = {
  MAX_TITLE_LENGTH: 200,
  MAX_URL_LENGTH: 2000,
} as const;

export const API_ROUTES = {
  BOOKMARKS: '/api/bookmarks',
  BOOKMARK_BY_ID: (id: string) => `/api/bookmarks/${id}`,
} as const;

export const AUTH = {
  CALLBACK_URL: '/auth/callback',
} as const;
