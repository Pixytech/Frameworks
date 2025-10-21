/**
 * IndexedDB module exports
 */
export { IndexedDBService } from './IndexedDBService';
export type { IIndexedDBService } from './IIndexedDBService';
export { CacheError, CacheErrorType } from './CacheError';
export { ResourceType } from './types';
export type {
  ResourceBlob,
  UserResourceMeta,
  CachedResource,
  PutResourceOptions,
  ListResourcesQuery,
  StorageEstimate,
  LRUCandidate
} from './types';

// Background Sync exports
export { BackgroundSyncService } from './BackgroundSyncService';
export type { IBackgroundSyncService } from './IBackgroundSyncService';
export { BackgroundSyncError, BackgroundSyncErrorType } from './BackgroundSyncError';
export { DEFAULT_CACHE_POLICY, SyncEventType, ServiceWorkerMessageType } from './BackgroundSyncTypes';
export type {
  CachePolicy,
  ServiceWorkerMessage,
  SyncCompletionData,
  ResourceFreshnessResult,
  FailedRequestData
} from './BackgroundSyncTypes';

// Cross-Tab Sync exports
export { CrossTabSyncService } from './CrossTabSyncService';
export type { ICrossTabSyncService } from './ICrossTabSyncService';
export { CrossTabSyncError, CrossTabSyncErrorType } from './CrossTabSyncError';
export { CrossTabMessageType, DEFAULT_CROSSTAB_CONFIG } from './CrossTabSyncTypes';
export type {
  CrossTabMessage,
  ResourceChangeData,
  SessionChangeData,
  SyncStatusData,
  AppStateChangeData,
  CrossTabSyncConfig
} from './CrossTabSyncTypes';

// Service type identifiers
export const IIndexedDBServiceType = Symbol.for('IIndexedDBService');
export const IBackgroundSyncServiceType = Symbol.for('IBackgroundSyncService');
export const ICrossTabSyncServiceType = Symbol.for('ICrossTabSyncService');