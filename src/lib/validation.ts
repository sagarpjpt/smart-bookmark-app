/**
 * Validates URL format
 * Checks if string is a valid URL with http or https protocol
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates bookmark title
 * Title must be non-empty and under 200 characters
 */
export function isValidTitle(title: string): boolean {
  return title.trim().length > 0 && title.length <= 200;
}

/**
 * Sanitizes string input by trimming whitespace
 */
export function sanitizeString(input: string): string {
  return input.trim();
}

/**
 * Validates pagination parameters
 * Ensures page and limit are positive integers
 */
export function validatePagination(page: number, limit: number): boolean {
  return (
    Number.isInteger(page) &&
    Number.isInteger(limit) &&
    page > 0 &&
    limit > 0 &&
    limit <= 100 // Max 100 items per page
  );
}
