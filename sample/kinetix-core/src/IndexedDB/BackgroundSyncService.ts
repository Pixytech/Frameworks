/**
 * Background Sync Service implementation
 */
import { injectable, inject } from 'inversify';
import { Observable, from, of, throwError, fromEvent, defer, forkJoin, merge } from 'rxjs';
import { map, switchMap, catchError, tap, filter, retry, take, shareReplay } from 'rxjs/operators';
import { IBackgroundSyncService } from './IBackgroundSyncService';
import type { IIndexedDBService } from './IIndexedDBService';
import type { IRestClientWithHead } from '../Web';
import { IRestClientWithHeadType } from '../Web';
import type { IContainer } from '../IoC';
import { CoreTypes } from '../CoreTypes';
import { ResourceType, StorageEstimate, UserResourceMeta } from './types';
import { 
  CachePolicy, 
  DEFAULT_CACHE_POLICY, 
  SyncEventType, 
  ServiceWorkerMessageType,
  ServiceWorkerMessage,
  SyncCompletionData,
  ResourceFreshnessResult,
  FailedRequestData
} from './BackgroundSyncTypes';
import { BackgroundSyncError } from './BackgroundSyncError';

/**
 * Background Sync Service
 */
@injectable()
export class BackgroundSyncService implements IBackgroundSyncService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private cachePolicy: CachePolicy = DEFAULT_CACHE_POLICY;
  private isInitialized = false;
  private messageHandler$: Observable<ServiceWorkerMessage>;
  private retryQueue: Map<string, FailedRequestData> = new Map();

  private _indexedDBService: IIndexedDBService | null = null;
  private _container: IContainer | null = null;

  constructor(
    @inject(IRestClientWithHeadType) private restClient: IRestClientWithHead,
    @inject(CoreTypes.IContainer) container: IContainer
  ) {
    // Setup message handler observable
    this.messageHandler$ = this.createMessageHandler();
    this._container = container;
  }


  /**
   * Lazily get IndexedDBService to avoid circular dependency
   */
  private get indexedDBService(): IIndexedDBService {
    if (!this._indexedDBService && this._container) {
      this._indexedDBService = this._container.build<IIndexedDBService>('IndexedDBService');
    }
    if (!this._indexedDBService) {
      throw new Error('IndexedDBService not available. Ensure BackgroundSyncService.setContainer() was called.');
    }
    return this._indexedDBService;
  }

  /**
   * Create message handler observable for Service Worker communication
   */
  private createMessageHandler(): Observable<ServiceWorkerMessage> {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
      return throwError(() => BackgroundSyncError.serviceWorkerError('Service Worker not supported'));
    }

    return fromEvent<MessageEvent>(navigator.serviceWorker, 'message').pipe(
      filter(event => event.data && event.data.type),
      map(event => event.data as ServiceWorkerMessage),
      shareReplay(1)
    );
  }

  /**
   * Initialize service worker and setup message listeners
   */
  initialize(): Observable<void> {
    if (this.isInitialized) {
      return of(undefined);
    }

    return defer(() => {
      if (!('serviceWorker' in navigator)) {
        return throwError(() => BackgroundSyncError.serviceWorkerError('Service Worker not supported'));
      }

      if (!('SyncManager' in window)) {
        return throwError(() => BackgroundSyncError.serviceWorkerError('Background Sync not supported'));
      }

      return from(navigator.serviceWorker.register('/service-worker.js', { scope: '/' }));
    }).pipe(
      tap(registration => {
        this.swRegistration = registration;
        this.isInitialized = true;
      }),
      switchMap(() => this.sendCachePolicyToServiceWorker()),
      switchMap(() => this.setupMessageListeners()),
      map(() => undefined),
      catchError(error => 
        throwError(() => BackgroundSyncError.serviceWorkerError('Failed to initialize', error))
      )
    );
  }

  /**
   * Setup message listeners for Service Worker communication
   */
  private setupMessageListeners(): Observable<void> {
    // Subscribe to specific message types
    this.messageHandler$.pipe(
      filter(msg => msg.type === ServiceWorkerMessageType.SYNC_COMPLETE)
    ).subscribe(msg => {
      this.handleSyncCompletion(msg.data).subscribe();
    });

    this.messageHandler$.pipe(
      filter(msg => msg.type === ServiceWorkerMessageType.STORAGE_PRESSURE_DETECTED)
    ).subscribe(() => {
      this.executePurge().subscribe();
    });

    return of(undefined);
  }

  /**
   * Send cache policy to Service Worker
   */
  private sendCachePolicyToServiceWorker(): Observable<void> {
    return defer(() => {
      if (!this.swRegistration || !this.swRegistration.active) {
        return throwError(() => BackgroundSyncError.serviceWorkerError('Service Worker not active'));
      }

      const message: ServiceWorkerMessage = {
        type: ServiceWorkerMessageType.UPDATE_CACHE_POLICY,
        data: this.cachePolicy,
        timestamp: new Date().toISOString()
      };

      this.swRegistration.active.postMessage(message);
      return of(undefined);
    });
  }

  /**
   * Register a background sync operation
   */
  registerSync(tag: SyncEventType, data?: any): Observable<void> {
    return defer(() => {
      if (!this.swRegistration) {
        return throwError(() => BackgroundSyncError.serviceWorkerError('Service Worker not registered'));
      }

      // Store sync data if provided
      if (data) {
        localStorage.setItem(`sync_${tag}`, JSON.stringify(data));
      }

      return from((this.swRegistration as any).sync.register(tag));
    }).pipe(
      map(() => undefined),
      catchError(error => 
        throwError(() => BackgroundSyncError.syncRegistrationError(`Failed to register sync: ${tag}`, error))
      )
    );
  }

  /**
   * Schedule cache cleanup based on policies
   */
  scheduleCleanup(): Observable<void> {
    return this.registerSync(SyncEventType.CACHE_CLEANUP);
  }

  /**
   * Schedule freshness validation for cached resources
   */
  scheduleResourceFreshness(): Observable<void> {
    return this.registerSync(SyncEventType.RESOURCE_FRESHNESS_CHECK);
  }

  /**
   * Handle sync completion messages from Service Worker
   */
  handleSyncCompletion(event: SyncCompletionData): Observable<void> {
    return defer(() => {
      console.debug(`[BackgroundSyncService] Sync completed: ${event.syncType}`, event);

      if (!event.success && event.error) {
        console.error(`[BackgroundSyncService] Sync failed: ${event.syncType}`, event.error);
      }

      // Handle specific sync type completions
      switch (event.syncType) {
        case SyncEventType.CACHE_CLEANUP:
          if (event.details?.resourcesPurged) {
            console.debug(`[BackgroundSyncService] Purged ${event.details.resourcesPurged} resources`);
          }
          break;

        case SyncEventType.RESOURCE_FRESHNESS_CHECK:
          if (event.details?.resourcesUpdated) {
            console.debug(`[BackgroundSyncService] Updated ${event.details.resourcesUpdated} stale resources`);
          }
          break;

        case SyncEventType.FAILED_REQUEST_RETRY:
          console.debug('[BackgroundSyncService] Failed request retry completed');
          break;
      }

      return of(undefined);
    });
  }

  /**
   * Update cache policy and send to Service Worker
   */
  updateCachePolicy(policy: CachePolicy): Observable<void> {
    this.cachePolicy = policy;
    
    if (this.isInitialized) {
      return this.sendCachePolicyToServiceWorker();
    }
    
    return of(undefined);
  }

  /**
   * Execute cache purge based on business policies
   */
  executePurge(): Observable<number> {
    let totalPurged = 0;

    // Calculate age threshold based on retention rules
    const now = Date.now();
    const oldestAllowedAge = now - this.cachePolicy.maxAge;
    const olderThan = new Date(oldestAllowedAge);

    return this.indexedDBService.purgeByAge(olderThan).pipe(
      tap((count: number) => { totalPurged += count; }),
      switchMap(() => this.indexedDBService.estimate()),
      switchMap((estimate: StorageEstimate) => {
        // Check if we need to purge by size
        const maxSize = this.cachePolicy.maxCacheSize;
        const pressureThreshold = this.cachePolicy.storagePressureThreshold;
        
        if (estimate.usage > maxSize || 
            (estimate.quota > 0 && estimate.usage / estimate.quota > pressureThreshold)) {
          // Need to free up space
          return this.indexedDBService.purgeBySize(maxSize * 0.7); // Target 70% of max
        }
        
        return of(0);
      }),
      tap((count: number) => { totalPurged += count; }),
      map(() => totalPurged),
      catchError(error => {
        console.error('[BackgroundSyncService] Purge execution failed:', error);
        return of(totalPurged);
      })
    );
  }

  /**
   * Execute resource validation and freshness checking
   */
  executeResourceValidation(): Observable<ResourceFreshnessResult[]> {
    return this.indexedDBService.getAllCachedResourceUrls().pipe(
      switchMap((urls: string[]) => {
        if (urls.length === 0) {
          return of([]);
        }

        // Check freshness for each URL
        const freshnessChecks$ = urls.map((url: string) => 
          this.checkResourceFreshness(url).pipe(
            map(result => result),
            catchError(error => {
              console.error(`[BackgroundSyncService] Failed to check freshness for ${url}:`, error);
              return of({
                url,
                isFresh: false,
                error: error.message
              } as ResourceFreshnessResult);
            })
          )
        );

        // Batch check resources
        return forkJoin(freshnessChecks$);
      }),
      tap((results: ResourceFreshnessResult[]) => {
        // Queue stale resources for refresh
        const staleResources = results.filter((r: ResourceFreshnessResult) => !r.isFresh);
        if (staleResources.length > 0) {
          console.debug(`[BackgroundSyncService] Found ${staleResources.length} stale resources`);
          // Mark resources as stale
          const staleUrls = staleResources.map((r: ResourceFreshnessResult) => r.url);
          this.indexedDBService.markResourcesStale(staleUrls).subscribe();
        }
      }),
      catchError(error => {
        console.error('[BackgroundSyncService] Resource validation failed:', error);
        return of([]);
      })
    );
  }

  /**
   * Check resource freshness using HEAD request
   */
  private checkResourceFreshness(url: string): Observable<ResourceFreshnessResult> {
    return forkJoin({
      cachedMeta: this.indexedDBService.getMeta(url),
      headResponse: this.restClient.head(url).pipe(
        catchError(() => of(null))
      )
    }).pipe(
      map(({ cachedMeta, headResponse }: { cachedMeta: UserResourceMeta | null; headResponse: Response | null }) => {
        const result: ResourceFreshnessResult = {
          url,
          isFresh: true
        };

        if (!cachedMeta || !headResponse) {
          result.isFresh = false;
          return result;
        }

        // Get server headers
        const serverETag = headResponse.headers.get('etag');
        const serverLastModified = headResponse.headers.get('last-modified');

        result.serverETag = serverETag || undefined;
        result.serverLastModified = serverLastModified || undefined;

        // Compare with cached values
        if (serverETag || serverLastModified) {
          // If we have server headers but no way to compare with cached version,
          // assume the resource might be stale
          result.isFresh = false;
          
          // If we have last modified dates, we can do a proper comparison
          if (serverLastModified && cachedMeta.userDataCachedAt) {
            const serverDate = new Date(serverLastModified).getTime();
            const cachedDate = new Date(cachedMeta.userDataCachedAt).getTime();
            result.isFresh = serverDate <= cachedDate;
          }
        }

        return result;
      })
    );
  }

  /**
   * Track a resource for background sync
   */
  trackResource(url: string): Observable<void> {
    // Resources are automatically tracked when cached through IndexedDBService
    // This method can be used for explicit tracking if needed
    return of(undefined);
  }

  /**
   * Handle network online event
   */
  onNetworkOnline(): Observable<void> {
    return defer(() => {
      console.debug('[BackgroundSyncService] Network online - triggering queued syncs');
      
      // Register sync for failed requests
      if (this.retryQueue.size > 0) {
        return this.registerSync(SyncEventType.FAILED_REQUEST_RETRY);
      }
      
      return of(undefined);
    });
  }

  /**
   * Handle network offline event
   */
  onNetworkOffline(): Observable<void> {
    return defer(() => {
      console.debug('[BackgroundSyncService] Network offline - pausing sync operations');
      return of(undefined);
    });
  }

  /**
   * Check if currently online
   */
  isOnline(): Observable<boolean> {
    return of(navigator.onLine);
  }

  /**
   * Queue failed operation for retry
   */
  queueForRetry(operation: string, data: any): Observable<void> {
    return defer(() => {
      const retryData: FailedRequestData = {
        url: operation,
        method: data.method || 'GET',
        retryCount: data.retryCount || 0,
        lastAttempt: new Date().toISOString(),
        maxRetries: 3,
        nextRetryDelay: Math.min(1000 * Math.pow(2, data.retryCount || 0), 30000) // Exponential backoff
      };

      this.retryQueue.set(operation, retryData);
      
      // Store in localStorage for persistence
      localStorage.setItem('sync_retry_queue', JSON.stringify(Array.from(this.retryQueue.entries())));
      
      return of(undefined);
    });
  }

  /**
   * Get current cache policy
   */
  getCachePolicy(): Observable<CachePolicy> {
    return of(this.cachePolicy);
  }

  /**
   * Clean up and unregister service worker
   */
  cleanup(): Observable<void> {
    return defer(() => {
      if (!this.swRegistration) {
        return of(undefined);
      }

      return from(this.swRegistration.unregister()).pipe(
        tap(() => {
          this.swRegistration = null;
          this.isInitialized = false;
        }),
        map(() => undefined)
      );
    });
  }
}