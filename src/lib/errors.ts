/**
 * Custom error class for application-specific errors
 * Extends Error with additional properties for better error handling
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Formats error responses for API routes
 * Ensures consistent error structure across all endpoints
 */
export function formatErrorResponse(error: unknown): { error: string; statusCode: number } {
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    };
  }

  return {
    error: 'An unexpected error occurred',
    statusCode: 500,
  };
}

/**
 * Logs errors to console with additional context
 * In production, this would send to error tracking service
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  console.error('Error occurred:', {
    error,
    context,
    timestamp: new Date().toISOString(),
  });
}
