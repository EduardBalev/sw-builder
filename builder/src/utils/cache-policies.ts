// src/cache-policies.ts

import { CachePolicy } from "../interfaces/cache-policies";

/**
 * Determines if a cached item has expired based on maxAge.
 * @param {Response} cachedResponse - The cached response to check.
 * @param {number} maxAgeSeconds - Max age in seconds before the item is considered stale.
 * @returns {boolean} - True if the cached item is expired, false otherwise.
 */
export function isExpired(
  cachedResponse: Response,
  maxAgeSeconds: number,
): boolean {
  const dateHeader = cachedResponse.headers.get("Date");
  if (!dateHeader) return false;

  const cachedTime = new Date(dateHeader).getTime();
  const now = Date.now();
  const ageInSeconds = (now - cachedTime) / 1000;
  return ageInSeconds > maxAgeSeconds;
}

/**
 * Handles cache expiration and cleanup for specific policies.
 * @param {Cache} cache - The cache to operate on.
 * @param {CachePolicy} policy - The caching policy with maxAgeSeconds and maxEntries.
 */
export async function applyExpirationPolicy(cache: Cache, policy: CachePolicy) {
  const cacheKeys = await cache.keys();

  // Apply maxAge expiration
  for (const request of cacheKeys) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse && isExpired(cachedResponse, policy.maxAgeSeconds)) {
      await cache.delete(request);
    }
  }

  // Apply maxEntries limit
  if (policy.maxEntries && cacheKeys.length > policy.maxEntries) {
    const keysToDelete = cacheKeys.slice(
      0,
      cacheKeys.length - policy.maxEntries,
    );
    for (const request of keysToDelete) {
      await cache.delete(request);
    }
  }
}
