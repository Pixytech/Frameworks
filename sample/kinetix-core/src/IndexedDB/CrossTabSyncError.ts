/**
 * Cross-Tab Sync Error implementation
 */

/**
 * Types of cross-tab sync errors
 */
export enum CrossTabSyncErrorType {
  BROADCAST_CHANNEL_ERROR = 'BROADCAST_CHANNEL_ERROR',
  MESSAGE_SERIALIZATION_ERROR = 'MESSAGE_SERIALIZATION_ERROR',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  MESSAGE_TIMEOUT = 'MESSAGE_TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Cross-Tab Sync Error class
 */
export class CrossTabSyncError extends Error {
  public readonly type: CrossTabSyncErrorType;
  public readonly originalError?: Error;

  constructor(message: string, type: CrossTabSyncErrorType, originalError?: Error) {
    super(message);
    this.name = 'CrossTabSyncError';
    this.type = type;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CrossTabSyncError);
    }
  }

  /**
   * Create error for BroadcastChannel issues
   */
  static broadcastChannelError(message: string, originalError?: Error): CrossTabSyncError {
    return new CrossTabSyncError(
      `BroadcastChannel error: ${message}`,
      CrossTabSyncErrorType.BROADCAST_CHANNEL_ERROR,
      originalError
    );
  }

  /**
   * Create error for message serialization failures
   */
  static messageSerializationError(message: string, originalError?: Error): CrossTabSyncError {
    return new CrossTabSyncError(
      `Message serialization error: ${message}`,
      CrossTabSyncErrorType.MESSAGE_SERIALIZATION_ERROR,
      originalError
    );
  }

  /**
   * Create error for unsupported features
   */
  static notSupported(message: string): CrossTabSyncError {
    return new CrossTabSyncError(
      `Not supported: ${message}`,
      CrossTabSyncErrorType.NOT_SUPPORTED
    );
  }

  /**
   * Create error for initialization failures
   */
  static initializationError(message: string, originalError?: Error): CrossTabSyncError {
    return new CrossTabSyncError(
      `Initialization error: ${message}`,
      CrossTabSyncErrorType.INITIALIZATION_ERROR,
      originalError
    );
  }

  /**
   * Create error for message timeouts
   */
  static messageTimeout(message: string): CrossTabSyncError {
    return new CrossTabSyncError(
      `Message timeout: ${message}`,
      CrossTabSyncErrorType.MESSAGE_TIMEOUT
    );
  }

  /**
   * Create unknown error
   */
  static unknown(message: string, originalError?: Error): CrossTabSyncError {
    return new CrossTabSyncError(
      `Unknown error: ${message}`,
      CrossTabSyncErrorType.UNKNOWN_ERROR,
      originalError
    );
  }
}