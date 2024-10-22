/**
 * Represents a cache entry within the service worker's caching system.
 *
 * This interface defines the structure of individual cache entries, including
 * metadata such as the cache name, the Time-To-Live (TTL), and an optional
 * timestamp for when the cache was last updated.
 */
export interface SwCache {
  /** The name of the cache entry, typically associated with a request or resource. */
  name: string;

  /** The Time-To-Live (TTL) for the cache entry, indicating how long the entry remains valid (in milliseconds). */
  ttl: number;

  /** An optional timestamp indicating when the cache entry was last updated. */
  updateTimestamp?: number;
}

/**
 * Represents a list of cache entries managed by the service worker.
 *
 * This type is a map where each cache entry is stored by its cache name as the key,
 * and the value is an `SwCache` object that contains the cache metadata such as
 * TTL and update timestamp.
 */
export type SwCacheList = Map<string, SwCache>;

/**
 * Common interface for cache strategies.
 */
export interface CacheStrategy {
  handle(request: Request): Promise<Response>;
  clear(): Promise<void>;
}
