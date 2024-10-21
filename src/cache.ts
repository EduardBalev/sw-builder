import { STATE } from "./consts";
import { logger } from "./logger";
import { fetchAndCache, updateEndpoints } from "./utils";

// TODO: Make better splitting to strategies.

export async function handleStaticCache(request: Request) {
  const cache = await caches.open(STATE.CONFIG.CACHE_NAME_STATIC);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    logger("STATIC Cache hit:", request.url);
    return cachedResponse;
  }

  logger("STATIC Cache miss - fetching from network:", request.url);
  const networkResponse = await fetch(request);
  cache.put(request, networkResponse.clone());

  return networkResponse;
}

export async function handleAPICache(request: Request, cacheName: string) {
  const cache = await caches.open(STATE.CONFIG.CACHE_NAME_API);
  const cachedResponse = await cache.match(request);
  const meta = STATE.CACHE_LIST.get(cacheName);
  const now = new Date().getTime();
  const updateTimestamp = meta?.updateTimestamp ?? now;
  const isManuallyUpdated = updateTimestamp < now;

  if (cachedResponse && !isManuallyUpdated && !isCacheExpired(cachedResponse)) {
    logger("API Cache hit:", request.url);
    return cachedResponse;
  }

  if (cachedResponse) {
    cache.delete(request);
    meta!.updateTimestamp = null;
  }
  logger("API Cache miss - fetching from network:", request.url);

  const networkResponse = await fetchAndCache(
    request,
    STATE.CACHE_LIST,
    STATE.CONFIG,
  );
  cache.put(request, networkResponse.clone());

  return networkResponse;
}

export async function clearAllAPICache() {
  await caches.delete(STATE.CONFIG.CACHE_NAME_API);
  await updateEndpoints(
    Array.from(STATE.CACHE_LIST.keys()),
    STATE.CACHE_LIST,
    STATE.CONFIG,
  );
  logger("Updating all endpoints");
}

export async function clearAllStaticCache() {
  await caches.delete(STATE.CONFIG.CACHE_NAME_STATIC);
  logger("Cleared static cache");
}

function isCacheExpired(cachedResponse: Response) {
  const cachedMetadata = getCachedMetadata(cachedResponse);
  const currentTime = new Date().getTime();
  const expiredTime = cachedMetadata?.expired || 0;

  return expiredTime < currentTime;
}

function getCachedMetadata(cachedResponse: Response) {
  const metadataString = cachedResponse.headers.get("X-Cache-Metadata");
  return metadataString ? JSON.parse(metadataString) : null;
}
