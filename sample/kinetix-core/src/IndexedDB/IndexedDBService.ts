/**
 * IndexedDB Service implementation using Dexie.js
 */
import Dexie, { Table } from 'dexie';
import { injectable, inject } from 'inversify';
import { Observable, from, of, throwError, defer, forkJoin } from 'rxjs';
import { map, switchMap, catchError, tap, toArray, concatMap } from 'rxjs/operators';
import { IIndexedDBService } from './IIndexedDBService';
import { 
  ResourceBlob, 
  UserResourceMeta, 
  CachedResource, 
  PutResourceOptions, 
  ListResourcesQuery, 
  StorageEstimate,
  LRUCandidate,
  ResourceType
} from './types';
import { CacheError, CacheErrorType } from './CacheError';
import type { IAuthenticationService } from '../Auth';
import { IAuthenticationServiceType } from '../Auth';

/**
 * Database name constant
 */
const DATABASE_NAME = 'Kx_IDB_Cache';

/**
 * Extended Dexie database with typed tables
 */
class CacheDatabase extends Dexie {
  resources_blob!: Table<ResourceBlob, string>;
  user_resources_meta!: Table<UserResourceMeta, string>;
  private static dbVersion: number | null = null;
  private static versionDetectionPromise: Promise<number> | null = null;

  constructor() {
    super(DATABASE_NAME);
    
    // Initialize with stored version or default
    this.initializeSchema();
    
    // Add error handlers
    this.on('blocked', () => {
      console.warn('[CacheDatabase] Database blocked - another tab may have an older version open');
    });
    
    this.on('versionchange', (event) => {
      console.warn('[CacheDatabase] Database version change detected:', event);
    });
  }

  private initializeSchema() {
    // Use the detected version or start with 1
    let version = CacheDatabase.dbVersion || 1;
    
    // Ensure version is an integer (Dexie requires integer versions)
    version = Math.ceil(version);
    
    
    // Define schema with the appropriate version
    this.version(version).stores({
      resources_blob: 'key, resourceType, resourceCachedAt, refCount',
      user_resources_meta: 'key, userId, resourceLastAccessedAt, permissionStatus'
    });
  }

  static async detectCurrentVersion(): Promise<number> {
    // Use singleton pattern to avoid multiple detections
    if (CacheDatabase.versionDetectionPromise) {
      return CacheDatabase.versionDetectionPromise;
    }

    CacheDatabase.versionDetectionPromise = (async () => {
      try {
        // Check if database exists
        const dbExists = await Dexie.exists(DATABASE_NAME);
        
        if (!dbExists) {
          CacheDatabase.dbVersion = 1;
          return 1;
        }
        
        // Open the database temporarily to get its version
        const tempDb = new Dexie(DATABASE_NAME);
        await tempDb.open();
        const currentVersion = tempDb.verno;
        await tempDb.close();
        
        
        // Ensure version is an integer
        const intVersion = Math.ceil(currentVersion);
        
        // Store the version for use in constructor
        CacheDatabase.dbVersion = intVersion;
        return intVersion;
      } catch (error) {
        console.error('[CacheDatabase] Error detecting database version:', error);
        // Default to version 1 if detection fails
        CacheDatabase.dbVersion = 1;
        return 1;
      }
    })();

    return CacheDatabase.versionDetectionPromise;
  }
}

/**
 * IndexedDB Service implementation
 */
@injectable()
export class IndexedDBService implements IIndexedDBService {
  private db: CacheDatabase | null = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    @inject(IAuthenticationServiceType) private authService: IAuthenticationService
  ) {
    // Database will be created lazily after version detection
  }

  /**
   * Get current user ID from authentication service
   */
  private getCurrentUserId(providedUserId?: string): Observable<string> {
    return defer(() => {
      if (providedUserId) {
        return of(providedUserId);
      }
      
      const token = this.authService.GetParsedToken();
      if (!token?.sub) {
        return throwError(() => new CacheError('User not authenticated', CacheErrorType.PERMISSION_DENIED));
      }
      
      return of(token.sub);
    });
  }

  /**
   * Normalize URL to consistent format
   */
  private normalizeUrl(url: string): string {
    // Always start with forward slash
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    // Remove trailing slash
    url = url.replace(/\/+$/, '');
    // Handle double slashes
    url = url.replace(/\/+/g, '/');
    return url;
  }

  /**
   * Generate blob key
   */
  private generateBlobKey(url: string): string {
    return this.normalizeUrl(url);
  }

  /**
   * Generate user metadata key
   */
  private generateMetaKey(userId: string, url: string): string {
    return `${userId}|${this.normalizeUrl(url)}`;
  }

  /**
   * Initialize the database
   */
  initialize(): Observable<void> {
    // If already initialized, return immediately
    if (this.initialized) {
      return of(undefined);
    }

    // If initialization is in progress, return the existing promise
    if (this.initializationPromise) {
      return from(this.initializationPromise);
    }

    // Create the initialization promise
    this.initializationPromise = (async () => {
      try {
        await CacheDatabase.detectCurrentVersion();
        
        if (!this.db) {
          this.db = new CacheDatabase();
        }
        
        await this.db.open();
        this.initialized = true;
        // Run cleanup but don't fail initialization if it fails
        try {
          await this.cleanupOrphanedBlobs();
        } catch (error) {
          console.warn('[IndexedDBService] Failed to cleanup orphaned blobs during initialization:', error);
        }
      } catch (error) {
        console.error('[IndexedDBService] Database initialization failed:', error);
        console.error('[IndexedDBService] Error details:', {
          name: (error as any)?.name,
          message: (error as any)?.message,
          stack: (error as any)?.stack
        });
        // Reset state on failure
        this.initializationPromise = null;
        this.initialized = false;
        this.db = null;
        throw CacheError.databaseError('Failed to initialize database', error as Error);
      }
    })();

    return from(this.initializationPromise).pipe(
      map(() => undefined),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Ensure database is initialized
   */
  private ensureInitialized(): Observable<void> {
    if (this.initialized) {
      return of(undefined);
    }
    return this.initialize();
  }

  /**
   * Get database instance, throw if not available
   */
  private getDb(): CacheDatabase {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Get cached resource for user
   */
  get(url: string, userId?: string): Observable<CachedResource | null> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.getCurrentUserId(userId)),
      switchMap((currentUserId) => {
        const metaKey = this.generateMetaKey(currentUserId, url);
        
        return from(this.getDb().user_resources_meta.get(metaKey)).pipe(
          switchMap((metadata) => {
            if (!metadata) {
              return of(null); // User has no access or resource doesn't exist
            }
            
            return from(this.getDb().resources_blob.get(metadata.blobKey)).pipe(
              switchMap((blobData) => {
                if (!blobData) {
                  // Blob missing - clean up orphaned metadata
                  return from(this.getDb().user_resources_meta.delete(metaKey)).pipe(
                    switchMap(() => 
                      throwError(() => CacheError.databaseError(`Blob not found for key: ${metadata.blobKey}`))
                    )
                  );
                }
                
                // Update last accessed timestamp
                return from(this.getDb().user_resources_meta.update(metaKey, {
                  resourceLastAccessedAt: new Date().toISOString()
                })).pipe(
                  map(() => ({
                    blob: blobData.blob,
                    contentType: blobData.contentType,
                    resourceType: blobData.resourceType,
                    size: blobData.size,
                    cachedAt: blobData.resourceCachedAt,
                    lastAccessedAt: metadata.resourceLastAccessedAt,
                    serverETag: blobData.serverETag,
                    serverLastModified: blobData.serverLastModified,
                    permissionStatus: metadata.permissionStatus,
                    permissionCacheExpiry: metadata.permissionCacheExpiry
                  }))
                );
              })
            );
          })
        );
      }),
      catchError((error) => {
        if (error instanceof CacheError) {
          return throwError(() => error);
        }
        return throwError(() => CacheError.databaseError('Failed to get resource', error as Error));
      })
    );
  }

  /**
   * Store resource with hybrid approach
   */
  put(url: string, options: PutResourceOptions, userId?: string): Observable<void> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.getCurrentUserId(userId)),
      switchMap((currentUserId) => {
        const blobKey = this.generateBlobKey(url);
        const metaKey = this.generateMetaKey(currentUserId, url);
        const now = new Date().toISOString();
        
        // Use transaction for consistency
        return from(this.getDb().transaction('rw', this.getDb().resources_blob, this.getDb().user_resources_meta, async () => {
          // Check if blob exists
          const existingBlob = await this.getDb().resources_blob.get(blobKey);
          
          if (existingBlob) {
            // Increment reference count
            await this.getDb().resources_blob.update(blobKey, {
              refCount: existingBlob.refCount + 1
            });
          } else {
            // Store new blob
            const blobData: ResourceBlob = {
              key: blobKey,
              blob: options.blob,
              refCount: 1,
              size: options.blob.size,
              contentType: options.contentType,
              resourceType: options.resourceType,
              resourceCachedAt: now,
              resourceLastSyncedAt: now,
              serverETag: options.serverETag,
              serverLastModified: options.serverLastModified
            };
            await this.getDb().resources_blob.add(blobData);
          }
          
          // Store or update user metadata
          const userMeta: UserResourceMeta = {
            key: metaKey,
            blobKey: blobKey,
            userId: currentUserId,
            url: url,
            userDataCachedAt: now,
            resourceLastAccessedAt: now,
            permissionStatus: options.permissionStatus,
            permissionCacheExpiry: options.permissionCacheExpiry,
            sessionId: options.sessionId,
            userLastPermissionCheckedAt: options.permissionStatus ? now : undefined
          };
          
          await this.getDb().user_resources_meta.put(userMeta);
        }));
      }),
      map(() => undefined),
      catchError((error) => {
        if (error instanceof Dexie.QuotaExceededError) {
          return throwError(() => CacheError.quotaExceeded('Storage quota exceeded', error));
        }
        return throwError(() => CacheError.databaseError('Failed to store resource', error as Error));
      })
    );
  }

  /**
   * Get user metadata only
   */
  getMeta(url: string, userId?: string): Observable<UserResourceMeta | null> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.getCurrentUserId(userId)),
      switchMap((currentUserId) => {
        const metaKey = this.generateMetaKey(currentUserId, url);
        return from(this.getDb().user_resources_meta.get(metaKey)).pipe(
          map(meta => meta || null)
        );
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to get metadata', error as Error))
      )
    );
  }

  /**
   * Remove user's access to resource
   */
  remove(url: string, userId?: string): Observable<void> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.getCurrentUserId(userId)),
      switchMap((currentUserId) => {
        const metaKey = this.generateMetaKey(currentUserId, url);
        
        return from(this.getDb().transaction('rw', this.getDb().resources_blob, this.getDb().user_resources_meta, async () => {
          // Get user metadata
          const metadata = await this.getDb().user_resources_meta.get(metaKey);
          if (!metadata) {
            return; // Nothing to remove
          }
          
          // Remove user metadata
          await this.getDb().user_resources_meta.delete(metaKey);
          
          // Decrement reference count
          const blobData = await this.getDb().resources_blob.get(metadata.blobKey);
          if (blobData) {
            if (blobData.refCount <= 1) {
              // Last reference - delete blob
              await this.getDb().resources_blob.delete(metadata.blobKey);
            } else {
              // Decrement count
              await this.getDb().resources_blob.update(metadata.blobKey, {
                refCount: blobData.refCount - 1
              });
            }
          }
        }));
      }),
      map(() => undefined),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to remove resource', error as Error))
      )
    );
  }

  /**
   * List user's accessible resources
   */
  list(userId?: string, query?: ListResourcesQuery): Observable<CachedResource[]> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.getCurrentUserId(userId)),
      switchMap((currentUserId) => {
        // Build query
        let collection = this.getDb().user_resources_meta
          .where('userId')
          .equals(currentUserId);
        
        // Get all user metadata
        return from(collection.toArray()).pipe(
          switchMap((userMetas) => {
            // Get corresponding blobs
            const results$ = userMetas.map(meta => 
              from(this.getDb().resources_blob.get(meta.blobKey)).pipe(
                map(blobData => {
                  if (!blobData) return null;
                  
                  // Apply filters
                  if (query?.resourceType && blobData.resourceType !== query.resourceType) {
                    return null;
                  }
                  
                  if (query?.olderThan) {
                    const accessedAt = new Date(meta.resourceLastAccessedAt);
                    if (accessedAt >= query.olderThan) {
                      return null;
                    }
                  }
                  
                  if (query?.newerThan) {
                    const accessedAt = new Date(meta.resourceLastAccessedAt);
                    if (accessedAt <= query.newerThan) {
                      return null;
                    }
                  }
                  
                  return {
                    blob: blobData.blob,
                    contentType: blobData.contentType,
                    resourceType: blobData.resourceType,
                    size: blobData.size,
                    cachedAt: blobData.resourceCachedAt,
                    lastAccessedAt: meta.resourceLastAccessedAt,
                    serverETag: blobData.serverETag,
                    serverLastModified: blobData.serverLastModified,
                    permissionStatus: meta.permissionStatus,
                    permissionCacheExpiry: meta.permissionCacheExpiry
                  } as CachedResource;
                })
              )
            );
            
            return results$.length > 0 ? forkJoin(results$) : of([]);
          }),
          map(results => {
            // Filter out nulls
            let finalResults = results.filter(r => r !== null) as CachedResource[];
            
            // Apply pagination
            if (query?.offset !== undefined) {
              finalResults = finalResults.slice(query.offset);
            }
            if (query?.limit !== undefined) {
              finalResults = finalResults.slice(0, query.limit);
            }
            
            return finalResults;
          })
        );
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to list resources', error as Error))
      )
    );
  }

  /**
   * Get storage statistics
   */
  estimate(): Observable<StorageEstimate> {
    return this.ensureInitialized().pipe(
      switchMap(() => {
        // Get browser storage estimate
        return from(navigator.storage.estimate()).pipe(
          switchMap((estimate) => {
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            
            // Get counts
            return forkJoin({
              blobCount: from(this.getDb().resources_blob.count()),
              metaCount: from(this.getDb().user_resources_meta.count()),
              allMetas: from(this.getDb().user_resources_meta.toArray())
            }).pipe(
              map(({ blobCount, metaCount, allMetas }) => {
                // Get unique user count
                const uniqueUsers = new Set(allMetas.map(m => m.userId)).size;
                
                return {
                  usage,
                  quota,
                  usagePercentage: quota > 0 ? (usage / quota) * 100 : 0,
                  userCount: uniqueUsers,
                  resourceCount: metaCount,
                  blobCount
                };
              })
            );
          })
        );
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to estimate storage', error as Error))
      )
    );
  }

  /**
   * Clear all user data
   */
  clearUser(userId?: string): Observable<number> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.getCurrentUserId(userId)),
      switchMap((currentUserId) => {
        return from(this.getDb().transaction('rw', this.getDb().resources_blob, this.getDb().user_resources_meta, async () => {
          // Get all user metadata
          const userMetas = await this.getDb().user_resources_meta
            .where('userId')
            .equals(currentUserId)
            .toArray();
          
          const clearedCount = userMetas.length;
          
          // Remove each resource (handles ref counting)
          for (const meta of userMetas) {
            // Inline remove logic to work within transaction
            await this.getDb().user_resources_meta.delete(meta.key);
            
            const blobData = await this.getDb().resources_blob.get(meta.blobKey);
            if (blobData) {
              if (blobData.refCount <= 1) {
                await this.getDb().resources_blob.delete(meta.blobKey);
              } else {
                await this.getDb().resources_blob.update(meta.blobKey, {
                  refCount: blobData.refCount - 1
                });
              }
            }
          }
          
          return clearedCount;
        }));
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to clear user data', error as Error))
      )
    );
  }

  /**
   * Clean up orphaned blobs (ref count = 0)
   */
  private async cleanupOrphanedBlobs(): Promise<void> {
    try {
      // Check if database exists and is open
      if (!this.db || !this.db.isOpen()) {
        return;
      }
      
      const orphanedBlobs = await this.getDb().resources_blob
        .where('refCount')
        .equals(0)
        .toArray();
      
      for (const blob of orphanedBlobs) {
        await this.getDb().resources_blob.delete(blob.key);
      }
    } catch (error) {
      console.warn('[IndexedDBService] Failed to cleanup orphaned blobs:', error);
    }
  }

  /**
   * Purge resources older than specified date
   */
  purgeByAge(olderThan: Date): Observable<number> {
    return this.ensureInitialized().pipe(
      switchMap(() => {
        const threshold = olderThan.toISOString();
        
        return from(this.getDb().transaction('rw', this.getDb().resources_blob, this.getDb().user_resources_meta, async () => {
          // Find old metadata
          const oldMetas = await this.getDb().user_resources_meta
            .where('resourceLastAccessedAt')
            .below(threshold)
            .toArray();
          
          // Remove each old resource
          for (const meta of oldMetas) {
            // Inline remove logic
            await this.getDb().user_resources_meta.delete(meta.key);
            
            const blobData = await this.getDb().resources_blob.get(meta.blobKey);
            if (blobData) {
              if (blobData.refCount <= 1) {
                await this.getDb().resources_blob.delete(meta.blobKey);
              } else {
                await this.getDb().resources_blob.update(meta.blobKey, {
                  refCount: blobData.refCount - 1
                });
              }
            }
          }
          
          return oldMetas.length;
        }));
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to purge by age', error as Error))
      )
    );
  }

  /**
   * Purge to stay under size limit
   */
  purgeBySize(maxBytes: number): Observable<number> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.estimate()),
      switchMap((estimate) => {
        if (estimate.usage <= maxBytes) {
          return of(0); // Already under limit
        }
        
        // Get LRU candidates
        return this.getLRUCandidates(100).pipe(
          switchMap((candidates) => {
            let currentUsage = estimate.usage;
            let purgedCount = 0;
            
            return from(candidates).pipe(
              concatMap((candidate) => {
                if (currentUsage <= maxBytes) {
                  return of(0);
                }
                
                // Find all users with this resource
                return from(this.getDb().user_resources_meta
                  .where('blobKey')
                  .equals(candidate.url)
                  .toArray()
                ).pipe(
                  switchMap((metas) => {
                    // Remove for all users
                    const removes$ = metas.map(meta => 
                      this.remove(meta.url, meta.userId).pipe(
                        tap(() => {
                          purgedCount++;
                          currentUsage -= candidate.size;
                        })
                      )
                    );
                    
                    return removes$.length > 0 ? forkJoin(removes$) : of([]);
                  }),
                  map(() => purgedCount)
                );
              }),
              toArray(),
              map(() => purgedCount)
            );
          })
        );
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to purge by size', error as Error))
      )
    );
  }

  /**
   * Get least recently used candidates
   */
  getLRUCandidates(count: number): Observable<LRUCandidate[]> {
    return this.ensureInitialized().pipe(
      switchMap(() => {
        // Get all metadata sorted by last accessed
        return from(this.getDb().user_resources_meta
          .orderBy('resourceLastAccessedAt')
          .limit(count * 2) // Get more than needed to account for duplicates
          .toArray()
        ).pipe(
          switchMap((allMetas) => {
            // Group by blob and find earliest access
            const blobMap = new Map<string, LRUCandidate>();
            
            const processedMetas$ = allMetas.map(meta => 
              from(this.getDb().resources_blob.get(meta.blobKey)).pipe(
                tap((blob) => {
                  if (blob) {
                    const existing = blobMap.get(meta.blobKey);
                    if (!existing || meta.resourceLastAccessedAt < existing.lastAccessedAt) {
                      blobMap.set(meta.blobKey, {
                        url: meta.blobKey,
                        lastAccessedAt: meta.resourceLastAccessedAt,
                        size: blob.size,
                        refCount: blob.refCount
                      });
                    }
                  }
                })
              )
            );
            
            return processedMetas$.length > 0 
              ? forkJoin(processedMetas$).pipe(
                  map(() => Array.from(blobMap.values())
                    .sort((a, b) => a.lastAccessedAt.localeCompare(b.lastAccessedAt))
                    .slice(0, count)
                  )
                )
              : of([]);
          })
        );
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to get LRU candidates', error as Error))
      )
    );
  }

  /**
   * Purge by resource type
   */
  purgeByResourceType(types: ResourceType[]): Observable<number> {
    return this.ensureInitialized().pipe(
      switchMap(() => {
        return from(this.getDb().transaction('rw', this.getDb().resources_blob, this.getDb().user_resources_meta, async () => {
          let purgedCount = 0;
          
          for (const type of types) {
            // Find blobs of this type
            const blobs = await this.getDb().resources_blob
              .where('resourceType')
              .equals(type)
              .toArray();
            
            for (const blob of blobs) {
              // Find all users with this blob
              const metas = await this.getDb().user_resources_meta
                .where('blobKey')
                .equals(blob.key)
                .toArray();
              
              // Remove for all users
              for (const meta of metas) {
                await this.getDb().user_resources_meta.delete(meta.key);
                purgedCount++;
              }
              
              // Delete the blob
              await this.getDb().resources_blob.delete(blob.key);
            }
          }
          
          return purgedCount;
        }));
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to purge by type', error as Error))
      )
    );
  }

  /**
   * Get user storage usage
   */
  getUserStorageUsage(userId?: string): Observable<number> {
    return this.ensureInitialized().pipe(
      switchMap(() => this.getCurrentUserId(userId)),
      switchMap((currentUserId) => {
        // Get all user metadata
        return from(this.getDb().user_resources_meta
          .where('userId')
          .equals(currentUserId)
          .toArray()
        ).pipe(
          switchMap((userMetas) => {
            // Calculate total size
            const seenBlobs = new Set<string>();
            
            const sizes$ = userMetas.map(meta => {
              if (!seenBlobs.has(meta.blobKey)) {
                seenBlobs.add(meta.blobKey);
                return from(this.getDb().resources_blob.get(meta.blobKey)).pipe(
                  map(blob => blob ? blob.size : 0)
                );
              }
              return of(0);
            });
            
            return sizes$.length > 0 
              ? forkJoin(sizes$).pipe(
                  map(sizes => sizes.reduce((total, size) => total + size, 0))
                )
              : of(0);
          })
        );
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to get user storage', error as Error))
      )
    );
  }

  /**
   * Update resource sync status
   */
  updateResourceSyncStatus(blobKey: string, lastSyncedAt: string): Observable<void> {
    return this.ensureInitialized().pipe(
      switchMap(() => 
        from(this.getDb().resources_blob.update(blobKey, {
          resourceLastSyncedAt: lastSyncedAt
        }))
      ),
      map(() => undefined),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to update sync status', error as Error))
      )
    );
  }

  /**
   * Mark resources as stale
   */
  markResourcesStale(blobKeys: string[]): Observable<void> {
    return this.ensureInitialized().pipe(
      switchMap(() => {
        const staleTime = new Date(0).toISOString(); // Epoch time indicates stale
        
        return from(this.getDb().transaction('rw', this.getDb().resources_blob, async () => {
          for (const key of blobKeys) {
            await this.getDb().resources_blob.update(key, {
              resourceLastSyncedAt: staleTime
            });
          }
        }));
      }),
      map(() => undefined),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to mark resources stale', error as Error))
      )
    );
  }

  /**
   * Mark resources as fresh
   */
  markResourcesFresh(blobKeys: string[]): Observable<void> {
    return this.ensureInitialized().pipe(
      switchMap(() => {
        const freshTime = new Date().toISOString();
        
        return from(this.getDb().transaction('rw', this.getDb().resources_blob, async () => {
          for (const key of blobKeys) {
            await this.getDb().resources_blob.update(key, {
              resourceLastSyncedAt: freshTime
            });
          }
        }));
      }),
      map(() => undefined),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to mark resources fresh', error as Error))
      )
    );
  }

  /**
   * Get resources needing sync
   */
  getResourcesNeedingSync(): Observable<string[]> {
    return this.ensureInitialized().pipe(
      switchMap(() => {
        // Consider resources older than 24 hours as needing sync
        const syncThreshold = new Date();
        syncThreshold.setHours(syncThreshold.getHours() - 24);
        const threshold = syncThreshold.toISOString();
        
        return from(this.getDb().resources_blob
          .where('resourceLastSyncedAt')
          .below(threshold)
          .toArray()
        ).pipe(
          map(staleBlobs => staleBlobs.map(b => b.key))
        );
      }),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to get resources needing sync', error as Error))
      )
    );
  }

  /**
   * Update server metadata
   */
  updateServerMetadata(
    blobKey: string, 
    metadata: { etag?: string; lastModified?: string }
  ): Observable<void> {
    return this.ensureInitialized().pipe(
      switchMap(() => 
        from(this.getDb().resources_blob.update(blobKey, {
          serverETag: metadata.etag,
          serverLastModified: metadata.lastModified
        }))
      ),
      map(() => undefined),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to update server metadata', error as Error))
      )
    );
  }

  /**
   * Get all cached resource URLs
   */
  getAllCachedResourceUrls(): Observable<string[]> {
    return this.ensureInitialized().pipe(
      switchMap(() => 
        from(this.getDb().resources_blob.orderBy('key').keys())
      ),
      map(keys => keys as string[]),
      catchError((error) => 
        throwError(() => CacheError.databaseError('Failed to get cached URLs', error as Error))
      )
    );
  }
}