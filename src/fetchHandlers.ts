import { handleAPICache, handleStaticCache } from "./cache";
import { STATE } from "./consts";
import { logger } from "./logger";
import { catchCashableRequests, getRequestHeader } from "./utils";

/**
 * Handles the fetch event and applies caching strategies based on the request type.
 *
 * This function intercepts network requests and applies cache logic depending on the
 * request URL, headers, and the service worker's configuration. It handles API caching,
 * static resource caching, and ignores requests that shouldn't be cached.
 *
 * @param {FetchEvent} event - The fetch event triggered by the browser.
 */
export function handleFetchEvent(event: FetchEvent) {
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
    logger(`Request ignored: ${event.request.url}`);
    return;
  }

  // Check if the request is for an HTML page
  const isHtmlRequest =
    event.request.headers.get("Accept")?.includes("text/html") ||
    requestUrl.pathname.endsWith(".html");

  // Exclude requests like HTML pages, chrome extensions, or WebSocket connections
  if (
    isHtmlRequest ||
    /^chrome-extension:|^ws:|\/runtime\./.test(event.request.url)
  ) {
    logger(`Excluded request: ${event.request.url}`);
    return;
  }

  // Handle API caching for dynamic content
  if (
    requestUrl.pathname.includes("/api/") &&
    !STATE.CONFIG.DISABLE_DYNAMIC_CACHE
  ) {
    logger(`Processing API request: ${event.request.url}`);

    // Use cache strategies for API requests
    catchCashableRequests(event.request, STATE.CACHE_LIST, STATE.CONFIG).then(
      () => {
        if (STATE.CACHE_LIST.has(cacheName)) {
          logger(`Serving API response from cache: ${cacheName}`);
          event.respondWith(handleAPICache(event.request, cacheName));
        }
      },
    );

    return;
  }

  // Handle static resource caching
  if (
    STATE.STATIC_RESOURCE_PATTERN.test(event.request.url) &&
    event.request.method === "GET" &&
    !STATE.CONFIG.DISABLE_STATIC_CACHE
  ) {
    logger(`Serving static resource from cache: ${event.request.url}`);
    event.respondWith(handleStaticCache(event.request));
    return;
  }

  logger(`No cache strategy applied for request: ${event.request.url}`);
}
