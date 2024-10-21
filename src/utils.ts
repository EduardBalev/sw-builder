import { SwCacheList } from "./interfaces/cache";
import { SWConfig } from "./interfaces/config";
import { NotifyData } from "./interfaces/notify-data";
import { logger } from "./logger";
import { swScope } from "./swScope";

/**
 * Retrieves the value of a specific header from a given request.
 *
 * @param {Request} request - The request object containing headers.
 * @param {string} headerName - The name of the header to retrieve.
 * @returns {string | null} The value of the specified header, or null if the header is not found.
 */
export function getRequestHeader(
  request: Request,
  headerName: string,
): string | null {
  return request?.headers?.get(toCapitalizedString(headerName));
}

/**
 * Sends a specified event to all connected clients (e.g., browser tabs or windows controlled by the service worker).
 *
 * @param {NotifyData} event - The event data to be sent to each connected client.
 */
export async function sendEvent(event: NotifyData) {
  // Log the event that is being sent
  logger("Sending event from Service Worker: ", event);

  try {
    // Get all connected clients (e.g., browser tabs or windows controlled by the service worker)
    const clients = await swScope.clients.matchAll();

    logger(`Found ${clients.length} clients to send the event to.`);

    // Send the event to each client
    for (let i = 0; i < clients.length; i++) {
      logger(`Sending event to client: ${clients[i].id}`);
      clients[i].postMessage(event);
    }

    logger("Event sent to all clients.");
  } catch (error) {
    logger("Error sending event to clients:", error);
  }
}

/**
 * Processes cacheable requests by checking headers and updating the cache if needed.
 *
 * @param {Request} request - The network request to check for cacheability.
 * @param {SwCacheList} cache - The cache list to store and update cache entries.
 * @param {SWConfig} config - The configuration containing header names and cache settings.
 * @returns {Promise<void>} A promise that resolves after processing the cache logic.
 */
export async function catchCashableRequests(
  request: Request,
  cache: SwCacheList,
  config: SWConfig,
): Promise<void> {
  // Cache header values to avoid repeated lookups
  const useCache = request.headers.get(config.CACHE_USE_CACHE_NAME);
  const name = request.headers.get(config.CACHE_HEADER_NAME);
  const ttl = request.headers.get(config.CACHE_TTL_NAME);
  const updateFor = request.headers.get(config.CACHE_DELETE_NAME);

  // Logging initial check for cache usage
  logger(`Checking if request should use cache: ${useCache}`);

  // If caching is not enabled, return early
  if (useCache !== "true") {
    logger(`Caching not enabled for this request.`);
    return;
  }

  logger(`Processing request for cacheable content.`);

  // Add new cache entry if not already present
  if (name && !cache.has(name)) {
    cache.set(name, {
      name,
      ttl: Number(ttl), // Convert ttl to a number
    });
    logger(`Cache entry added: ${name} with TTL: ${ttl}`);
  } else if (name) {
    logger(`Cache entry for ${name} already exists.`);
  }

  // Update specified endpoints if needed
  if (updateFor) {
    const names = updateFor.split(",");

    if (names.length > 0) {
      logger(`Updating cache for the following endpoints: ${names}`);
      await updateEndpoints(names, cache, config);
    }
  }
}

/**
 * Updates the cache entries by setting the update timestamp and removing expired entries based on provided names.
 *
 * @param {string[]} names - The list of cache entry names to update.
 * @param {SwCacheList} cache - The cache list where the entries are stored.
 * @param {SWConfig} config - The configuration containing cache settings and header names.
 * @returns {Promise<void>} A promise that resolves once all cache entries have been updated and expired entries are deleted.
 */
export async function updateEndpoints(
  names: string[],
  cache: SwCacheList,
  config: SWConfig,
): Promise<void> {
  const now = Date.now(); // Cache current timestamp to avoid multiple Date object creation

  logger(`Updating endpoints: ${names.join(", ")}`);

  // Update the timestamp for each endpoint in the cache
  for (const name of names) {
    const data = cache.get(name);
    if (data) {
      data.updateTimestamp = now;
      logger(`Updated timestamp for cache entry: ${name}`);
    } else {
      logger(`Cache entry not found for: ${name}`);
    }
  }

  const cacheInstance = await caches.open(config.CACHE_NAME_API);
  logger(`Opened cache: ${config.CACHE_NAME_API}`);

  const keys = await cacheInstance.keys(); // Retrieve all cached requests
  logger(`Retrieved ${keys.length} cached requests`);

  // Delete matching cached requests based on header names
  const deletePromises = [];
  for (const req of keys) {
    const cacheName = req.headers.get(config.CACHE_HEADER_NAME);
    if (cacheName && names.includes(cacheName)) {
      logger(`Deleting cache entry for: ${cacheName}`);
      deletePromises.push(cacheInstance.delete(req));
    }
  }

  // Wait for all cache deletions to complete
  await Promise.all(deletePromises);
  logger(`Deleted ${deletePromises.length} cache entries`);
}

/**
 * Fetches a request from the network and caches the response with metadata.
 *
 * @param {Request} request - The network request to fetch.
 * @param {SwCacheList} cache - The cache list where the cache metadata will be stored.
 * @param {SWConfig} config - The configuration containing cache settings and header names.
 * @returns {Promise<Response>} A promise that resolves to the fetched response with cache metadata.
 */
export async function fetchAndCache(
  request: Request,
  cache: SwCacheList,
  config: SWConfig,
): Promise<Response> {
  try {
    logger(`Fetching request: ${request.url}`);

    // Fetch the response from the network
    const response = await fetch(request);
    const cacheName = getRequestHeader(request, config.CACHE_HEADER_NAME);

    // Check if the response is valid before caching
    if (!response || response.status !== 200) {
      logger(
        `Fetch failed or invalid response for: ${request.url} - Status: ${response?.status}`,
      );
      return response;
    }

    logger(`Fetch successful for: ${request.url}, caching response.`);

    // Get the cache metadata
    const ttl = cache.get(cacheName)?.ttl || 0;
    const expiredTimestamp = Date.now() + ttl;
    const cacheMetadata = { expired: expiredTimestamp };

    // Clone the response to attach metadata
    const responseWithMetadata = new Response(response.body, {
      ...response,
      headers: new Headers(response.headers),
    });

    // Attach cache metadata to the response headers
    responseWithMetadata.headers.append(
      "X-Cache-Metadata",
      JSON.stringify(cacheMetadata),
    );
    logger(
      `Attached cache metadata for: ${request.url}, expires at: ${expiredTimestamp}`,
    );

    return responseWithMetadata;
  } catch (error) {
    logger(`Fetch failed for: ${request.url}`, error);
    throw error;
  }
}

/**
 * Converts any case string to a pattern where only the first letter of the entire string is capitalized
 * and the rest of the string is in lowercase.
 *
 * @param {string} input - The input string to be converted.
 * @returns {string} The formatted string where only the first letter is capitalized.
 */
function toCapitalizedString(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
