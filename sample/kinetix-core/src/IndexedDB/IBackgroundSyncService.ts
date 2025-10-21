/**
 * Interface for Background Sync Service
 */
import { Observable } from 'rxjs';
import { 
  CachePolicy, 
  SyncEventType, 
  SyncCompletionData,
  ResourceFreshnessResult 
} from './BackgroundSyncTypes';

export interface IBackgroundSyncService {
  /**
   * Initialize service worker and setup message listeners
   */
  initialize(): Observable<void>;

  /**
   * Register a background sync operation
   * @param tag Sync event tag
   * @param data Optional data for the sync operation
   */
  registerSync(tag: SyncEventType, data?: any): Observable<void>;

  /**
   * Schedule cache cleanup based on policies
   */
  scheduleCleanup(): Observable<void>;

  /**
   * Schedule freshness validation for cached resources
   */
  scheduleResourceFreshness(): Observable<void>;

  /**
   * Handle sync completion messages from Service Worker
   * @param event Sync completion event data
   */
  handleSyncCompletion(event: SyncCompletionData): Observable<void>;

  /**
   * Update cache policy and send to Service Worker
   * @param policy New cache policy
   */
  updateCachePolicy(policy: CachePolicy): Observable<void>;

  /**
   * Execute cache purge based on business policies
   */
  executePurge(): Observable<number>;

  /**
   * Execute resource validation and freshness checking
   */
  executeResourceValidation(): Observable<ResourceFreshnessResult[]>;

  /**
   * Track a resource for background sync
   * @param url Resource URL to track
   */
  trackResource(url: string): Observable<void>;

  /**
   * Handle network online event
   */
  onNetworkOnline(): Observable<void>;

  /**
   * Handle network offline event
   */
  onNetworkOffline(): Observable<void>;

  /**
   * Check if currently online
   */
  isOnline(): Observable<boolean>;

  /**
   * Queue failed operation for retry
   * @param operation Operation identifier
   * @param data Operation data
   */
  queueForRetry(operation: string, data: any): Observable<void>;

  /**
   * Get current cache policy
   */
  getCachePolicy(): Observable<CachePolicy>;

  /**
   * Clean up and unregister service worker
   */
  cleanup(): Observable<void>;
}