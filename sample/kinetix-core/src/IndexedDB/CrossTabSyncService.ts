/**
 * Cross-Tab Sync Service implementation
 */
import { injectable } from 'inversify';
import { Observable, Subject, fromEvent, of, throwError, merge, EMPTY } from 'rxjs';
import { filter, map, catchError, tap, takeUntil, shareReplay } from 'rxjs/operators';
import { ICrossTabSyncService } from './ICrossTabSyncService';
import { 
  CrossTabMessage,
  CrossTabMessageType,
  ResourceChangeData,
  SessionChangeData,
  SyncStatusData,
  AppStateChangeData,
  CrossTabSyncConfig,
  DEFAULT_CROSSTAB_CONFIG
} from './CrossTabSyncTypes';
import { CrossTabSyncError } from './CrossTabSyncError';

/**
 * Cross-Tab Sync Service
 */
@injectable()
export class CrossTabSyncService implements ICrossTabSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private storageEventSubject = new Subject<CrossTabMessage>();
  private destroySubject = new Subject<void>();
  private tabId: string;
  private config: CrossTabSyncConfig = DEFAULT_CROSSTAB_CONFIG;
  private isInitialized = false;
  private messageStream$: Observable<CrossTabMessage>;

  constructor() {
    this.tabId = this.generateTabId();
    this.messageStream$ = this.createMessageStream();
  }

  /**
   * Generate unique tab ID
   */
  private generateTabId(): string {
    return `tab_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }

  /**
   * Create unified message stream from all sources
   */
  private createMessageStream(): Observable<CrossTabMessage> {
    const broadcastStream$ = this.isSupported() 
      ? this.createBroadcastChannelStream() 
      : EMPTY;

    const storageStream$ = this.config.enableFallback 
      ? this.storageEventSubject.asObservable() 
      : EMPTY;

    return merge(broadcastStream$, storageStream$).pipe(
      filter(msg => msg.tabId !== this.tabId), // Ignore own messages
      tap(msg => console.log('[CrossTabSync] Received message from other tab:', msg.type, msg.data)),
      takeUntil(this.destroySubject),
      shareReplay(1)
    );
  }

  /**
   * Create BroadcastChannel message stream
   */
  private createBroadcastChannelStream(): Observable<CrossTabMessage> {
    if (!this.broadcastChannel) {
      return EMPTY;
    }

    return fromEvent<MessageEvent>(this.broadcastChannel, 'message').pipe(
      map(event => event.data as CrossTabMessage),
      catchError(error => {
        console.error('[CrossTabSyncService] BroadcastChannel message error:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Initialize the service
   */
  initialize(config?: CrossTabSyncConfig): Observable<void> {
    return new Observable(observer => {
      try {
        if (this.isInitialized) {
          observer.next();
          observer.complete();
          return;
        }

        // Merge config
        this.config = { ...DEFAULT_CROSSTAB_CONFIG, ...config };

        // Initialize BroadcastChannel if supported
        if (this.isSupported()) {
          try {
            this.broadcastChannel = new BroadcastChannel(this.config.channelName!);
            this.messageStream$ = this.createMessageStream();
          } catch (error) {
            if (!this.config.enableFallback) {
              throw CrossTabSyncError.broadcastChannelError('Failed to create BroadcastChannel', error as Error);
            }
            console.warn('[CrossTabSyncService] BroadcastChannel creation failed, using fallback:', error);
          }
        }

        // Initialize fallback if enabled
        if (this.config.enableFallback && (!this.isSupported() || !this.broadcastChannel)) {
          this.initializeFallback();
        }

        this.isInitialized = true;
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(CrossTabSyncError.initializationError('Failed to initialize', error as Error));
      }
    });
  }

  /**
   * Initialize localStorage fallback
   */
  private initializeFallback(): void {
    // Listen for storage events
    fromEvent<StorageEvent>(window, 'storage').pipe(
      filter(event => event.key === `${this.config.channelName}_message`),
      filter(event => event.newValue !== null),
      map(event => {
        try {
          return JSON.parse(event.newValue!) as CrossTabMessage;
        } catch (error) {
          console.error('[CrossTabSyncService] Failed to parse storage message:', error);
          return null;
        }
      }),
      filter(msg => msg !== null),
      takeUntil(this.destroySubject)
    ).subscribe(message => {
      this.storageEventSubject.next(message!);
    });
  }

  /**
   * Check if BroadcastChannel is supported
   */
  isSupported(): boolean {
    return typeof BroadcastChannel !== 'undefined';
  }

  /**
   * Broadcast a message to all other tabs
   */
  broadcast(messageType: CrossTabMessageType, data: any): Observable<void> {
    return new Observable(observer => {
      try {
        const message: CrossTabMessage = {
          type: messageType,
          timestamp: Date.now(),
          tabId: this.tabId,
          data,
          userId: this.getCurrentUserId(),
          sessionId: this.getCurrentSessionId()
        };

        console.log('[CrossTabSync] Broadcasting message:', messageType, data);
        
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage(message);
        } else if (this.config.enableFallback) {
          this.broadcastFallback(message);
        } else {
          throw CrossTabSyncError.notSupported('No broadcast method available');
        }

        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(CrossTabSyncError.broadcastChannelError('Failed to broadcast message', error as Error));
      }
    });
  }

  /**
   * Broadcast using localStorage fallback
   */
  private broadcastFallback(message: CrossTabMessage): void {
    try {
      const key = `${this.config.channelName}_message`;
      localStorage.setItem(key, JSON.stringify(message));
      // Immediately remove to trigger storage event
      setTimeout(() => localStorage.removeItem(key), 10);
    } catch (error) {
      throw CrossTabSyncError.messageSerializationError('Failed to serialize message', error as Error);
    }
  }

  /**
   * Subscribe to messages of a specific type
   */
  subscribe(messageType: CrossTabMessageType): Observable<CrossTabMessage> {
    return this.messageStream$.pipe(
      filter(msg => msg.type === messageType)
    );
  }

  /**
   * Subscribe to all messages
   */
  subscribeAll(): Observable<CrossTabMessage> {
    return this.messageStream$;
  }

  // Cache synchronization methods
  notifyResourceCached(url: string, metadata: ResourceChangeData): Observable<void> {
    return this.broadcast(CrossTabMessageType.RESOURCE_CACHED, {
      ...metadata,
      url,
      action: 'cached' as const
    });
  }

  notifyResourceUpdated(url: string, changes: ResourceChangeData): Observable<void> {
    return this.broadcast(CrossTabMessageType.RESOURCE_UPDATED, {
      ...changes,
      url,
      action: 'updated' as const
    });
  }

  notifyResourceRemoved(url: string): Observable<void> {
    return this.broadcast(CrossTabMessageType.RESOURCE_REMOVED, {
      url,
      action: 'removed' as const
    });
  }

  notifyCacheCleared(reason: string): Observable<void> {
    return this.broadcast(CrossTabMessageType.CACHE_CLEARED, { reason });
  }

  onResourceChange(): Observable<CrossTabMessage<ResourceChangeData>> {
    return merge(
      this.subscribe(CrossTabMessageType.RESOURCE_CACHED),
      this.subscribe(CrossTabMessageType.RESOURCE_UPDATED),
      this.subscribe(CrossTabMessageType.RESOURCE_REMOVED),
      this.subscribe(CrossTabMessageType.CACHE_CLEARED)
    );
  }

  // Session management methods
  notifyUserLogin(userId: string, permissions?: any): Observable<void> {
    return this.broadcast(CrossTabMessageType.USER_LOGIN, {
      userId,
      permissions
    } as SessionChangeData);
  }

  notifyUserLogout(reason?: string): Observable<void> {
    return this.broadcast(CrossTabMessageType.USER_LOGOUT, {
      reason,
      redirectTo: '/login'
    } as SessionChangeData);
  }

  notifySessionExpired(): Observable<void> {
    return this.broadcast(CrossTabMessageType.SESSION_EXPIRED, {
      reason: 'session_timeout',
      redirectTo: '/login'
    } as SessionChangeData);
  }

  onSessionChange(): Observable<CrossTabMessage<SessionChangeData>> {
    return merge(
      this.subscribe(CrossTabMessageType.USER_LOGIN),
      this.subscribe(CrossTabMessageType.USER_LOGOUT),
      this.subscribe(CrossTabMessageType.SESSION_EXPIRED),
      this.subscribe(CrossTabMessageType.PERMISSION_CHANGED)
    );
  }

  // Background sync integration methods
  notifySyncStarted(syncType: string): Observable<void> {
    return this.broadcast(CrossTabMessageType.SYNC_STARTED, {
      syncType,
      status: 'started'
    } as SyncStatusData);
  }

  notifySyncCompleted(syncType: string, results: any): Observable<void> {
    return this.broadcast(CrossTabMessageType.SYNC_COMPLETED, {
      syncType,
      status: 'completed',
      ...results
    } as SyncStatusData);
  }

  notifySyncFailed(syncType: string, error: any): Observable<void> {
    return this.broadcast(CrossTabMessageType.SYNC_FAILED, {
      syncType,
      status: 'failed',
      error: error.message || error
    } as SyncStatusData);
  }

  onSyncStatusChange(): Observable<CrossTabMessage<SyncStatusData>> {
    return merge(
      this.subscribe(CrossTabMessageType.SYNC_STARTED),
      this.subscribe(CrossTabMessageType.SYNC_COMPLETED),
      this.subscribe(CrossTabMessageType.SYNC_FAILED),
      this.subscribe(CrossTabMessageType.FRESHNESS_CHECK_COMPLETE)
    );
  }

  // Application state methods
  notifyNavigationChange(path: string): Observable<void> {
    return this.broadcast(CrossTabMessageType.NAVIGATION_CHANGE, {
      path
    } as AppStateChangeData);
  }

  notifyPreferenceUpdated(preferences: Record<string, any>): Observable<void> {
    return this.broadcast(CrossTabMessageType.PREFERENCE_UPDATED, {
      preferences
    } as AppStateChangeData);
  }

  notifyFeatureFlagChanged(featureFlags: Record<string, boolean>): Observable<void> {
    return this.broadcast(CrossTabMessageType.FEATURE_FLAG_CHANGED, {
      featureFlags
    } as AppStateChangeData);
  }

  onAppStateChange(): Observable<CrossTabMessage<AppStateChangeData>> {
    return merge(
      this.subscribe(CrossTabMessageType.NAVIGATION_CHANGE),
      this.subscribe(CrossTabMessageType.PREFERENCE_UPDATED),
      this.subscribe(CrossTabMessageType.FEATURE_FLAG_CHANGED)
    );
  }

  /**
   * Get current tab ID
   */
  getTabId(): string {
    return this.tabId;
  }

  /**
   * Get current user ID (placeholder - should integrate with auth service)
   */
  private getCurrentUserId(): string | undefined {
    // TODO: Integrate with AuthenticationService
    return undefined;
  }

  /**
   * Get current session ID (placeholder - should integrate with auth service)
   */
  private getCurrentSessionId(): string | undefined {
    // TODO: Integrate with AuthenticationService
    return undefined;
  }

  /**
   * Clean up resources
   */
  cleanup(): Observable<void> {
    return new Observable(observer => {
      try {
        this.dispose();
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(CrossTabSyncError.unknown('Failed to cleanup', error as Error));
      }
    });
  }

  /**
   * IDisposable implementation
   */
  dispose(): void {
    this.destroySubject.next();
    this.destroySubject.complete();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    this.isInitialized = false;
  }
}