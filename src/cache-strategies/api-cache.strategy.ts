import { CacheStrategy, SwCacheList } from "../interfaces/cache";
import { SWConfig } from "../interfaces/config";
import { logger } from "../logger";
import { fetchAndCache, updateEndpoints } from "../utils";
/**
 * Handles caching for API requests.
 *
 * This class provides logic to manage API request caching, including
 * checking the cache, fetching from the network if necessary, and clearing
 * outdated cache entries. It utilizes a cache strategy to serve cached responses
 * efficiently.
 */
export class APICacheStrategy implements CacheStrategy {
  private cacheName: string;
  private cacheList: SwCacheList;
  private config: SWConfig;

  /**
   * Constructs the APICacheStrategy class.
   *
   * @param {string} cacheName - The name of the cache used for API requests.
   * @param {SwCacheList} cacheList - A map of cache metadata used to manage API cache entries.
   * @param {SWConfig} config - The service worker configuration.
   */
  constructor(cacheName: string, cacheList: SwCacheList, config: SWConfig) {
    this.cacheName = cacheName;
    this.cacheList = cacheList;
    this.config = config;
  }

  /**
   * Handles an API request by either serving from the cache or fetching from the network.
   *
   * @param {Request} request - The API request to be handled.
   * @returns {Promise<Response>} - The cached response or the network response.
   */
  async handle(request: Request): Promise<Response> {
    const cache = await caches.open(this.config.CACHE_NAME_API);
    const cachedResponse = await cache.match(request);
    const meta = this.cacheList.get(this.cacheName);
    const now = Date.now();
    const updateTimestamp = meta?.updateTimestamp ?? now;
    const isManuallyUpdated = updateTimestamp < now;

    logger(`Handling API request for: ${request.url}`);

    // Serve from cache if available and valid
    if (
      cachedResponse &&
      !isManuallyUpdated &&
      !this.isCacheExpired(cachedResponse)
    ) {
      logger(`API Cache hit: ${request.url}`);
      return cachedResponse;
    }

    // If the cache is outdated, delete it
    if (cachedResponse) {
      logger(`API Cache outdated - deleting cached entry: ${request.url}`);
      await cache.delete(request);
      if (meta) {
        meta.updateTimestamp = null;
      }
    }

    // Fetch from network and cache the response
    logger(`API Cache miss - fetching from network: ${request.url}`);
    const networkResponse = await fetchAndCache(
      request,
      this.cacheList,
      this.config,
    );
    cache.put(request, networkResponse.clone());

    return networkResponse;
  }

  /**
   * Clears the API cache and updates all cached endpoints.
   *
   * This method deletes the current API cache and forces updates for all
   * endpoints stored in the cache list.
   */
  async clear(): Promise<void> {
    logger("Clearing API cache...");
    await caches.delete(this.config.CACHE_NAME_API);
    await updateEndpoints(
      Array.from(this.cacheList.keys()),
      this.cacheList,
      this.config,
    );
    logger("API cache cleared and endpoints updated.");
  }

  /**
   * Checks if the cached response has expired.
   *
   * @param {Response} cachedResponse - The cached response to check.
   * @returns {boolean} - True if the cache has expired, false otherwise.
   */
  private isCacheExpired(cachedResponse: Response): boolean {
    const cachedMetadata = this.getCachedMetadata(cachedResponse);
    const currentTime = Date.now();
    const expiredTime = cachedMetadata?.expired || 0;
    const isExpired = expiredTime < currentTime;

    logger(
      `Cache expiration check for ${cachedResponse.url}: ${isExpired ? "Expired" : "Valid"}`,
    );
    return isExpired;
  }

  /**
   * Extracts cache metadata from the cached response headers.
   *
   * @param {Response} cachedResponse - The cached response to extract metadata from.
   * @returns {any} - The parsed metadata or null if no metadata is available.
   */
  private getCachedMetadata(cachedResponse: Response): any {
    const metadataString = cachedResponse.headers.get("X-Cache-Metadata");
    logger(`Extracting cache metadata for ${cachedResponse.url}`);
    return metadataString ? JSON.parse(metadataString) : null;
  }
}
