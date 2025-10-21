/**
 * Custom error types for Background Sync operations
 */

export enum BackgroundSyncErrorType {
  SERVICE_WORKER_ERROR = 'SERVICE_WORKER_ERROR',
  SYNC_REGISTRATION_ERROR = 'SYNC_REGISTRATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GENERAL_SYNC_ERROR = 'GENERAL_SYNC_ERROR'
}

/**
 * Base Background Sync error class
 */
export class BackgroundSyncError extends Error {
  public readonly type: BackgroundSyncErrorType;
  public readonly originalError?: Error;

  constructor(message: string, type: BackgroundSyncErrorType, originalError?: Error) {
    super(message);
    this.name = 'BackgroundSyncError';
    this.type = type;
    this.originalError = originalError;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BackgroundSyncError);
    }
  }

  /**
   * Factory method for Service Worker errors
   */
  static serviceWorkerError(message: string, originalError?: Error): BackgroundSyncError {
    return new BackgroundSyncError(
      `Service Worker Error: ${message}`,
      BackgroundSyncErrorType.SERVICE_WORKER_ERROR,
      originalError
    );
  }

  /**
   * Factory method for sync registration errors
   */
  static syncRegistrationError(message: string, originalError?: Error): BackgroundSyncError {
    return new BackgroundSyncError(
      `Sync Registration Error: ${message}`,
      BackgroundSyncErrorType.SYNC_REGISTRATION_ERROR,
      originalError
    );
  }

  /**
   * Factory method for network errors
   */
  static networkError(message: string, originalError?: Error): BackgroundSyncError {
    return new BackgroundSyncError(
      `Network Error: ${message}`,
      BackgroundSyncErrorType.NETWORK_ERROR,
      originalError
    );
  }

  /**
   * Factory method for general sync errors
   */
  static generalError(message: string, originalError?: Error): BackgroundSyncError {
    return new BackgroundSyncError(
      message,
      BackgroundSyncErrorType.GENERAL_SYNC_ERROR,
      originalError
    );
  }
}