import { CacheStrategy } from "../interfaces/cache";
import { logger } from "../logger";

/**
 * Handles caching for static resources.
 *
 * This class provides logic to manage static resource caching, including
 * checking the cache for existing resources and fetching from the network
 * if the cache is unavailable. It utilizes a cache strategy to serve static
 * content efficiently.
 */
export class StaticCacheStrategy implements CacheStrategy {
  private cacheName: string;

  /**
   * Constructs the StaticCacheStrategy class.
   *
   * @param {string} cacheName - The name of the cache used for static resources.
   */
  constructor(cacheName: string) {
    this.cacheName = cacheName;
  }

  /**
   * Handles a static resource request by either serving from the cache or fetching from the network.
   *
   * @param {Request} request - The static resource request to be handled.
   * @returns {Promise<Response>} - The cached response or the network response.
   */
  async handle(request: Request): Promise<Response> {
    const cache = await caches.open(this.cacheName);
    const cachedResponse = await cache.match(request);

    logger(`Handling static resource request for: ${request.url}`);

    // Serve from cache if available
    if (cachedResponse) {
      logger(`STATIC Cache hit: ${request.url}`);
      return cachedResponse;
    }

    // Fetch from network and cache the response
    logger(`STATIC Cache miss - fetching from network: ${request.url}`);
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());

    logger(`Cached static resource: ${request.url}`);
    return networkResponse;
  }

  /**
   * Clears the static resource cache.
   *
   * This method deletes the entire static resource cache associated with the cache name.
   */
  async clear(): Promise<void> {
    logger(`Clearing static cache: ${this.cacheName}`);
    await caches.delete(this.cacheName);
    logger(`Static cache cleared: ${this.cacheName}`);
  }
}
