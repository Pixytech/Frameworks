/**
 * Types and interfaces for Background Sync Service
 */

/**
 * Cache policy configuration
 */
export interface CachePolicy {
  maxAge: number;                    // Maximum age in milliseconds
  maxCacheSize: number;              // Maximum total cache size in bytes
  retentionRules: {
    PNG: number;                     // 30 days in milliseconds
    JPEG: number;                    // 30 days in milliseconds  
    PDF: number;                     // 30 days in milliseconds
    JSON: number;                    // 30 days in milliseconds
    HTML: number;                    // 30 days in milliseconds
  };
  storagePressureThreshold: number;  // 0.8 (80% of quota)
  cleanupTriggers: {
    onAppStart: boolean;
    onForegroundResume: boolean;
    afterLargeWrites: boolean;
    onStoragePressure: boolean;
  };
}

/**
 * Default cache policy with 30-day retention for all resources
 */
export const DEFAULT_CACHE_POLICY: CachePolicy = {
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
  maxCacheSize: 30 * 1024 * 1024 * 1024,    // 30 GB
  retentionRules: {
    PNG: 30 * 24 * 60 * 60 * 1000,    // 30 days
    JPEG: 30 * 24 * 60 * 60 * 1000,   // 30 days
    PDF: 30 * 24 * 60 * 60 * 1000,    // 30 days
    JSON: 30 * 24 * 60 * 60 * 1000,   // 30 days
    HTML: 30 * 24 * 60 * 60 * 1000    // 30 days
  },
  storagePressureThreshold: 0.8,      // 80% of quota
  cleanupTriggers: {
    onAppStart: true,
    onForegroundResume: false,
    afterLargeWrites: true,
    onStoragePressure: true
  }
};

/**
 * Sync event types
 */
export enum SyncEventType {
  CACHE_CLEANUP = 'cache-cleanup',
  RESOURCE_FRESHNESS_CHECK = 'resource-freshness-check',
  FAILED_REQUEST_RETRY = 'failed-request-retry',
  USER_SESSION_SYNC = 'user-session-sync'
}

/**
 * Service Worker message types
 */
export enum ServiceWorkerMessageType {
  UPDATE_CACHE_POLICY = 'UPDATE_CACHE_POLICY',
  SYNC_COMPLETE = 'SYNC_COMPLETE',
  SYNC_FAILED = 'SYNC_FAILED',
  CACHE_CLEANUP_COMPLETE = 'CACHE_CLEANUP_COMPLETE',
  FRESHNESS_CHECK_COMPLETE = 'FRESHNESS_CHECK_COMPLETE',
  STORAGE_PRESSURE_DETECTED = 'STORAGE_PRESSURE_DETECTED'
}

/**
 * Service Worker message interface
 */
export interface ServiceWorkerMessage {
  type: ServiceWorkerMessageType;
  data?: any;
  error?: string;
  timestamp: string;
}

/**
 * Resource freshness result
 */
export interface ResourceFreshnessResult {
  url: string;
  isFresh: boolean;
  serverETag?: string;
  serverLastModified?: string;
  cachedETag?: string;
  cachedLastModified?: string;
}

/**
 * Sync completion event data
 */
export interface SyncCompletionData {
  syncType: SyncEventType;
  success: boolean;
  error?: string;
  details?: {
    resourcesChecked?: number;
    resourcesUpdated?: number;
    resourcesPurged?: number;
    storageFreed?: number;
  };
}

/**
 * Failed request retry data
 */
export interface FailedRequestData {
  url: string;
  method: string;
  retryCount: number;
  lastAttempt: string;
  maxRetries: number;
  nextRetryDelay: number;
}