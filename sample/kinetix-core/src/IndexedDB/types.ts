/**
 * Types and interfaces for IndexedDB Service
 */

/**
 * Supported resource types
 */
export enum ResourceType {
  PNG = 'PNG',
  JPEG = 'JPEG',
  PDF = 'PDF',
  JSON = 'JSON',
  HTML = 'HTML'
}

/**
 * Resource blob data stored in resources_blob table
 */
export interface ResourceBlob {
  key: string; // Resource URL (primary key)
  blob: Blob; // Actual binary data
  refCount: number; // Number of users who have this cached
  size: number; // Blob size in bytes
  contentType: string; // MIME type
  resourceType: ResourceType; // File type
  resourceCachedAt: string; // ISO string - when downloaded from server
  resourceLastSyncedAt: string; // ISO string - when BackgroundSyncService last checked
  serverETag?: string; // Server ETag for freshness comparison
  serverLastModified?: string; // ISO string - server last modified timestamp
}

/**
 * User-specific metadata stored in user_resources_meta table
 */
export interface UserResourceMeta {
  key: string; // userId|resourceURL format (primary key)
  blobKey: string; // Reference to resources_blob record
  userId: string; // User identifier
  url: string; // Resource URL
  userDataCachedAt: string; // ISO string - when user metadata was created
  userLastPermissionCheckedAt?: string; // ISO string - when permissions last verified
  resourceLastAccessedAt: string; // ISO string - when user last viewed resource
  permissionStatus?: 'granted' | 'denied' | null; // Current permission
  permissionCacheExpiry?: string; // ISO string - when permission cache expires
  sessionId?: string; // User session identifier
}

/**
 * Combined resource data returned to callers
 */
export interface CachedResource {
  blob: Blob;
  contentType: string;
  resourceType: ResourceType;
  size: number;
  cachedAt: string;
  lastAccessedAt: string;
  serverETag?: string;
  serverLastModified?: string;
  permissionStatus?: 'granted' | 'denied' | null;
  permissionCacheExpiry?: string;
}

/**
 * Options for storing a resource
 */
export interface PutResourceOptions {
  blob: Blob;
  contentType: string;
  resourceType: ResourceType;
  serverETag?: string;
  serverLastModified?: string;
  permissionStatus?: 'granted' | 'denied' | null;
  permissionCacheExpiry?: string;
  sessionId?: string;
}

/**
 * Query options for listing resources
 */
export interface ListResourcesQuery {
  resourceType?: ResourceType;
  olderThan?: Date;
  newerThan?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Storage estimation result
 */
export interface StorageEstimate {
  usage: number; // Bytes used
  quota: number; // Total quota in bytes
  usagePercentage: number; // Usage as percentage
  userCount: number; // Number of unique users
  resourceCount: number; // Total number of cached resources
  blobCount: number; // Total number of shared blobs
}

/**
 * LRU candidate for cleanup
 */
export interface LRUCandidate {
  url: string;
  lastAccessedAt: string;
  size: number;
  refCount: number;
}