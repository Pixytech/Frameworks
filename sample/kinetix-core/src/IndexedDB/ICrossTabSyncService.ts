/**
 * Interface for Cross-Tab Sync Service
 */
import { Observable } from 'rxjs';
import { IDisposable } from '../Core';
import { 
  CrossTabMessage,
  CrossTabMessageType,
  ResourceChangeData,
  SessionChangeData,
  SyncStatusData,
  AppStateChangeData,
  CrossTabSyncConfig
} from './CrossTabSyncTypes';

export interface ICrossTabSyncService extends IDisposable {
  /**
   * Initialize the cross-tab sync service
   * @param config Optional configuration
   */
  initialize(config?: CrossTabSyncConfig): Observable<void>;

  /**
   * Check if cross-tab sync is supported
   */
  isSupported(): boolean;

  /**
   * Broadcast a message to all other tabs
   * @param messageType The type of message to send
   * @param data The message data
   */
  broadcast(messageType: CrossTabMessageType, data: any): Observable<void>;

  /**
   * Subscribe to messages of a specific type
   * @param messageType The type of message to subscribe to
   */
  subscribe(messageType: CrossTabMessageType): Observable<CrossTabMessage>;

  /**
   * Subscribe to all messages
   */
  subscribeAll(): Observable<CrossTabMessage>;

  // Cache synchronization methods
  /**
   * Notify other tabs that a resource was cached
   */
  notifyResourceCached(url: string, metadata: ResourceChangeData): Observable<void>;

  /**
   * Notify other tabs that a resource was updated
   */
  notifyResourceUpdated(url: string, changes: ResourceChangeData): Observable<void>;

  /**
   * Notify other tabs that a resource was removed
   */
  notifyResourceRemoved(url: string): Observable<void>;

  /**
   * Notify other tabs that the cache was cleared
   */
  notifyCacheCleared(reason: string): Observable<void>;

  /**
   * Subscribe to all resource change events
   */
  onResourceChange(): Observable<CrossTabMessage<ResourceChangeData>>;

  // Session management methods
  /**
   * Notify other tabs of user login
   */
  notifyUserLogin(userId: string, permissions?: any): Observable<void>;

  /**
   * Notify other tabs of user logout
   */
  notifyUserLogout(reason?: string): Observable<void>;

  /**
   * Notify other tabs of session expiration
   */
  notifySessionExpired(): Observable<void>;

  /**
   * Subscribe to all session change events
   */
  onSessionChange(): Observable<CrossTabMessage<SessionChangeData>>;

  // Background sync integration methods
  /**
   * Notify other tabs that sync started
   */
  notifySyncStarted(syncType: string): Observable<void>;

  /**
   * Notify other tabs that sync completed
   */
  notifySyncCompleted(syncType: string, results: any): Observable<void>;

  /**
   * Notify other tabs that sync failed
   */
  notifySyncFailed(syncType: string, error: any): Observable<void>;

  /**
   * Subscribe to all sync status changes
   */
  onSyncStatusChange(): Observable<CrossTabMessage<SyncStatusData>>;

  // Application state methods
  /**
   * Notify other tabs of navigation change
   */
  notifyNavigationChange(path: string): Observable<void>;

  /**
   * Notify other tabs of preference update
   */
  notifyPreferenceUpdated(preferences: Record<string, any>): Observable<void>;

  /**
   * Notify other tabs of feature flag change
   */
  notifyFeatureFlagChanged(featureFlags: Record<string, boolean>): Observable<void>;

  /**
   * Subscribe to all application state changes
   */
  onAppStateChange(): Observable<CrossTabMessage<AppStateChangeData>>;

  /**
   * Get the current tab ID
   */
  getTabId(): string;

  /**
   * Clean up resources
   */
  cleanup(): Observable<void>;
}