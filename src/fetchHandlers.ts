import { APICacheStrategy } from "./cache-strategies/api-cache.strategy";
import { StaticCacheStrategy } from "./cache-strategies/static-cache.strategy";
import { STATE } from "./consts";
import { SwState } from "./interfaces/state";
import { logger } from "./logger";
import { swScope } from "./swScope";
import {
  catchCashableRequests,
  getRequestHeader,
  matchesPattern,
} from "./utils";

/**
 * Initializes caching strategies and attaches event handlers for the service worker.
 *
 * This function sets up the service worker by creating caching strategies and
 * binding the necessary event listeners such as the `fetch` event listener.
 */
export function initFetchHandlers(strategies: SwState["STRATEGIES"]) {
  logger("Initializing caching strategies...");

  logger("Caching strategies initialized successfully.");

  // Attach fetch event listener and pass strategies
  swScope.addEventListener("fetch", (event) => {
    logger(`Fetch event detected for: ${event.request.url}`);
    handleFetchEvent(event, strategies.apiCache, strategies.staticCache);
  });
  logger("Fetch event listener attached.");
}

/**
 * Handles the fetch event and applies caching strategies based on the request type.
 *
 * @param {FetchEvent} event - The fetch event triggered by the browser.
 * @param {APICacheStrategy} apiCacheStrategy - The strategy used for caching API requests.
 * @param {StaticCacheStrategy} staticCacheStrategy - The strategy used for caching static resources.
 */
export function handleFetchEvent(
  event: FetchEvent,
  apiCacheStrategy: APICacheStrategy,
  staticCacheStrategy: StaticCacheStrategy,
) {
  const requestUrl = new URL(event.request.url);
  const ignore = getRequestHeader(
    event.request,
    STATE.CONFIG.CACHE_IGNORE_NAME,
  );
  const cacheName = getRequestHeader(
    event.request,
    STATE.CONFIG.CACHE_HEADER_NAME,
  );

  logger(`Handling fetch event for: ${event.request.url}`);

  // Ignore requests based on the CACHE_IGNORE_NAME header
  if (ignore) {
    logger(
      `Request ignored due to CACHE_IGNORE_NAME header: ${event.request.url}`,
    );
    return;
  }

  // Check exclusion patterns from config (e.g., Chrome extensions, WebSocket)
  if (matchesPattern(requestUrl.href, STATE.CONFIG.EXCLUDE_PATTERNS)) {
    logger(`Request excluded: ${event.request.url}`);
    return;
  }

  // Handle API caching for dynamic content based on API patterns in the config
  if (
    matchesPattern(requestUrl.pathname, STATE.CONFIG.API_PATTERNS) &&
    !STATE.CONFIG.DISABLE_DYNAMIC_CACHE
  ) {
    logger(`Processing API request: ${event.request.url}`);

    catchCashableRequests(event.request, STATE.CACHE_LIST, STATE.CONFIG).then(
      () => {
        if (STATE.CACHE_LIST.has(cacheName)) {
          logger(`Serving API response from cache: ${cacheName}`);
          event.respondWith(apiCacheStrategy.handle(event.request));
        }
      },
    );

    return;
  }

  // Handle static resource caching using patterns defined in the config
  if (
    matchesPattern(requestUrl.href, STATE.CONFIG.STATIC_RESOURCE_PATTERN) &&
    event.request.method === "GET" &&
    !STATE.CONFIG.DISABLE_STATIC_CACHE
  ) {
    logger(`Serving static resource from cache: ${event.request.url}`);
    event.respondWith(staticCacheStrategy.handle(event.request));
    return;
  }

  logger(`No cache strategy applied for request: ${event.request.url}`);
}
