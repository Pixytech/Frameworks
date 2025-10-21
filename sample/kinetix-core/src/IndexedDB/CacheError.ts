/**
 * Custom error types for IndexedDB operations
 */
export enum CacheErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  CORRUPTION = 'CORRUPTION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_STATE = 'INVALID_STATE'
}

/**
 * Custom error class for cache operations
 */
export class CacheError extends Error {
  public readonly type: CacheErrorType;
  public readonly originalError?: Error;

  constructor(message: string, type: CacheErrorType, originalError?: Error) {
    super(message);
    this.name = 'CacheError';
    this.type = type;
    this.originalError = originalError;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CacheError);
    }
  }

  /**
   * Factory method for quota exceeded errors
   */
  static quotaExceeded(message?: string, originalError?: Error): CacheError {
    return new CacheError(
      message || 'Storage quota exceeded',
      CacheErrorType.QUOTA_EXCEEDED,
      originalError
    );
  }

  /**
   * Factory method for not found errors
   */
  static notFound(resource: string): CacheError {
    return new CacheError(
      `Resource not found: ${resource}`,
      CacheErrorType.NOT_FOUND
    );
  }

  /**
   * Factory method for database errors
   */
  static databaseError(message: string, originalError?: Error): CacheError {
    return new CacheError(
      `Database error: ${message}`,
      CacheErrorType.DATABASE_ERROR,
      originalError
    );
  }
}