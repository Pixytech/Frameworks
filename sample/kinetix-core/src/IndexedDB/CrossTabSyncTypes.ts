/**
 * Types for Cross-Tab Synchronization
 */

/**
 * Cross-tab message types
 */
export enum CrossTabMessageType {
  // Cache-related events
  RESOURCE_CACHED = 'RESOURCE_CACHED',
  RESOURCE_UPDATED = 'RESOURCE_UPDATED',
  RESOURCE_REMOVED = 'RESOURCE_REMOVED',
  CACHE_CLEARED = 'CACHE_CLEARED',
  STORAGE_PRESSURE = 'STORAGE_PRESSURE',

  // User session events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',

  // Background sync events
  SYNC_STARTED = 'SYNC_STARTED',
  SYNC_COMPLETED = 'SYNC_COMPLETED',
  SYNC_FAILED = 'SYNC_FAILED',
  FRESHNESS_CHECK_COMPLETE = 'FRESHNESS_CHECK_COMPLETE',

  // Application state events
  NAVIGATION_CHANGE = 'NAVIGATION_CHANGE',
  PREFERENCE_UPDATED = 'PREFERENCE_UPDATED',
  FEATURE_FLAG_CHANGED = 'FEATURE_FLAG_CHANGED'
}

/**
 * Cross-tab message structure
 */
export interface CrossTabMessage<T = any> {
  type: CrossTabMessageType;
  timestamp: number;
  tabId: string;
  data: T;
  userId?: string;
  sessionId?: string;
}

/**
 * Resource change event data
 */
export interface ResourceChangeData {
  url: string;
  resourceType?: string;
  size?: number;
  userId?: string;
  action: 'cached' | 'updated' | 'removed';
}

/**
 * Session change event data
 */
export interface SessionChangeData {
  userId?: string;
  reason?: string;
  redirectTo?: string;
  permissions?: any;
}

/**
 * Sync status event data
 */
export interface SyncStatusData {
  syncType: string;
  status: 'started' | 'completed' | 'failed';
  itemsProcessed?: number;
  itemsRemoved?: number;
  storageFreed?: number;
  error?: string;
}

/**
 * Application state change data
 */
export interface AppStateChangeData {
  path?: string;
  preferences?: Record<string, any>;
  featureFlags?: Record<string, boolean>;
}

/**
 * Cross-tab sync configuration
 */
export interface CrossTabSyncConfig {
  channelName?: string;
  enableFallback?: boolean;
  messageTimeout?: number;
  retryAttempts?: number;
}

/**
 * Default configuration
 */
export const DEFAULT_CROSSTAB_CONFIG: CrossTabSyncConfig = {
  channelName: 'kinetix-crosstab-sync',
  enableFallback: true,
  messageTimeout: 5000,
  retryAttempts: 3
};