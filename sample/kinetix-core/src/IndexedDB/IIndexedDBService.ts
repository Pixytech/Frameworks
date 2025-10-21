/**
 * Interface for IndexedDB Service
 */
import { Observable } from 'rxjs';
import { 
  CachedResource, 
  PutResourceOptions, 
  ListResourcesQuery, 
  StorageEstimate,
  LRUCandidate,
  ResourceType,
  UserResourceMeta
} from './types';

export interface IIndexedDBService {
  /**
   * Initialize the database and ensure schema is up to date
   */
  initialize(): Observable<void>;

  /**
   * Primary Resource Operations
   */
  
  /**
   * Retrieve cached resource for specific user
   * @param url Resource URL
   * @param userId User identifier (optional - will be retrieved from auth service if not provided)
   * @returns Cached resource data or null if not found
   */
  get(url: string, userId?: string): Observable<CachedResource | null>;

  /**
   * Store resource with user metadata using hybrid approach
   * @param url Resource URL
   * @param options Resource data and metadata
   * @param userId User identifier (optional - will be retrieved from auth service if not provided)
   * @returns Success indicator
   */
  put(url: string, options: PutResourceOptions, userId?: string): Observable<void>;

  /**
   * Get user-specific metadata only
   * @param url Resource URL
   * @param userId User identifier (optional - will be retrieved from auth service if not provided)
   * @returns User metadata or null if not found
   */
  getMeta(url: string, userId?: string): Observable<UserResourceMeta | null>;

  /**
   * Remove user's access to resource (handles reference counting)
   * @param url Resource URL
   * @param userId User identifier (optional - will be retrieved from auth service if not provided)
   * @returns Success indicator
   */
  remove(url: string, userId?: string): Observable<void>;

  /**
   * List user's accessible resources with optional filtering
   * @param userId User identifier (optional - will be retrieved from auth service if not provided)
   * @param query Optional filtering criteria
   * @returns Array of cached resources
   */
  list(userId?: string, query?: ListResourcesQuery): Observable<CachedResource[]>;

  /**
   * Get storage usage and quota statistics
   * @returns Storage estimation data
   */
  estimate(): Observable<StorageEstimate>;

  /**
   * Remove all user-specific metadata (maintains reference counting)
   * @param userId User identifier (optional - will be retrieved from auth service if not provided)
   * @returns Number of resources cleared
   */
  clearUser(userId?: string): Observable<number>;

  /**
   * Purge Operations (for BackgroundSyncService)
   */

  /**
   * Delete resources older than specified timestamp
   * @param olderThan Date threshold
   * @returns Number of resources purged
   */
  purgeByAge(olderThan: Date): Observable<number>;

  /**
   * Implement LRU deletion to stay under size limit
   * @param maxBytes Maximum storage size in bytes
   * @returns Number of resources purged
   */
  purgeBySize(maxBytes: number): Observable<number>;

  /**
   * Get least recently used resources for cleanup
   * @param count Number of candidates to return
   * @returns Array of LRU candidates
   */
  getLRUCandidates(count: number): Observable<LRUCandidate[]>;

  /**
   * Clean specific resource types
   * @param types Array of resource types to clean
   * @returns Number of resources purged
   */
  purgeByResourceType(types: ResourceType[]): Observable<number>;

  /**
   * Calculate per-user storage consumption
   * @param userId User identifier (optional - will be retrieved from auth service if not provided)
   * @returns Storage used in bytes
   */
  getUserStorageUsage(userId?: string): Observable<number>;

  /**
   * Revalidate Operations (for BackgroundSyncService)
   */

  /**
   * Update sync timestamp
   * @param blobKey Resource URL/key
   * @param lastSyncedAt ISO timestamp
   */
  updateResourceSyncStatus(blobKey: string, lastSyncedAt: string): Observable<void>;

  /**
   * Mark resources as needing refresh
   * @param blobKeys Array of resource URLs/keys
   */
  markResourcesStale(blobKeys: string[]): Observable<void>;

  /**
   * Mark resources as up-to-date
   * @param blobKeys Array of resource URLs/keys
   */
  markResourcesFresh(blobKeys: string[]): Observable<void>;

  /**
   * Get resources that need freshness validation
   * @returns Array of resource URLs that need sync
   */
  getResourcesNeedingSync(): Observable<string[]>;

  /**
   * Update server comparison data
   * @param blobKey Resource URL/key
   * @param metadata Server metadata (etag, lastModified)
   */
  updateServerMetadata(blobKey: string, metadata: { etag?: string; lastModified?: string }): Observable<void>;

  /**
   * Get all cached resource URLs
   * @returns Array of all cached resource URLs
   */
  getAllCachedResourceUrls(): Observable<string[]>;
}