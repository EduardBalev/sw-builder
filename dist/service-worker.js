// src/consts.ts
var STATE = {
  CONFIG: null,
  STATIC_RESOURCE_PATTERN: new RegExp(""),
  CACHE_LIST: /* @__PURE__ */ new Map()
};

// src/logger.ts
var __loggerIsEnabled = false;
function enableLogger() {
  __loggerIsEnabled = true;
}
function logger(...data) {
  if (__loggerIsEnabled) {
    console.log(...data);
  }
}

// src/swScope.ts
var swScope = self;

// src/utils.ts
function getRequestHeader(request, headerName) {
  return request?.headers?.get(toCapitalizedString(headerName));
}
async function sendEvent(event) {
  logger("Sending event from Service Worker: ", event);
  try {
    const clients = await swScope.clients.matchAll();
    logger(`Found ${clients.length} clients to send the event to.`);
    for (let i = 0; i < clients.length; i++) {
      logger(`Sending event to client: ${clients[i].id}`);
      clients[i].postMessage(event);
    }
    logger("Event sent to all clients.");
  } catch (error) {
    logger("Error sending event to clients:", error);
  }
}
async function catchCashableRequests(request, cache, config) {
  const useCache = request.headers.get(config.CACHE_USE_CACHE_NAME);
  const name = request.headers.get(config.CACHE_HEADER_NAME);
  const ttl = request.headers.get(config.CACHE_TTL_NAME);
  const updateFor = request.headers.get(config.CACHE_DELETE_NAME);
  logger(`Checking if request should use cache: ${useCache}`);
  if (useCache !== "true") {
    logger(`Caching not enabled for this request.`);
    return;
  }
  logger(`Processing request for cacheable content.`);
  if (name && !cache.has(name)) {
    cache.set(name, {
      name,
      ttl: Number(ttl)
      // Convert ttl to a number
    });
    logger(`Cache entry added: ${name} with TTL: ${ttl}`);
  } else if (name) {
    logger(`Cache entry for ${name} already exists.`);
  }
  if (updateFor) {
    const names = updateFor.split(",");
    if (names.length > 0) {
      logger(`Updating cache for the following endpoints: ${names}`);
      await updateEndpoints(names, cache, config);
    }
  }
}
async function updateEndpoints(names, cache, config) {
  const now = Date.now();
  logger(`Updating endpoints: ${names.join(", ")}`);
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
  const keys = await cacheInstance.keys();
  logger(`Retrieved ${keys.length} cached requests`);
  const deletePromises = [];
  for (const req of keys) {
    const cacheName = req.headers.get(config.CACHE_HEADER_NAME);
    if (cacheName && names.includes(cacheName)) {
      logger(`Deleting cache entry for: ${cacheName}`);
      deletePromises.push(cacheInstance.delete(req));
    }
  }
  await Promise.all(deletePromises);
  logger(`Deleted ${deletePromises.length} cache entries`);
}
async function fetchAndCache(request, cache, config) {
  try {
    logger(`Fetching request: ${request.url}`);
    const response = await fetch(request);
    const cacheName = getRequestHeader(request, config.CACHE_HEADER_NAME);
    if (!response || response.status !== 200) {
      logger(
        `Fetch failed or invalid response for: ${request.url} - Status: ${response?.status}`
      );
      return response;
    }
    logger(`Fetch successful for: ${request.url}, caching response.`);
    const ttl = cache.get(cacheName)?.ttl || 0;
    const expiredTimestamp = Date.now() + ttl;
    const cacheMetadata = { expired: expiredTimestamp };
    const responseWithMetadata = new Response(response.body, {
      ...response,
      headers: new Headers(response.headers)
    });
    responseWithMetadata.headers.append(
      "X-Cache-Metadata",
      JSON.stringify(cacheMetadata)
    );
    logger(
      `Attached cache metadata for: ${request.url}, expires at: ${expiredTimestamp}`
    );
    return responseWithMetadata;
  } catch (error) {
    logger(`Fetch failed for: ${request.url}`, error);
    throw error;
  }
}
function toCapitalizedString(input) {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

// src/cache.ts
async function handleStaticCache(request) {
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
async function handleAPICache(request, cacheName) {
  const cache = await caches.open(STATE.CONFIG.CACHE_NAME_API);
  const cachedResponse = await cache.match(request);
  const meta = STATE.CACHE_LIST.get(cacheName);
  const now = (/* @__PURE__ */ new Date()).getTime();
  const updateTimestamp = meta?.updateTimestamp ?? now;
  const isManuallyUpdated = updateTimestamp < now;
  if (cachedResponse && !isManuallyUpdated && !isCacheExpired(cachedResponse)) {
    logger("API Cache hit:", request.url);
    return cachedResponse;
  }
  if (cachedResponse) {
    cache.delete(request);
    meta.updateTimestamp = null;
  }
  logger("API Cache miss - fetching from network:", request.url);
  const networkResponse = await fetchAndCache(
    request,
    STATE.CACHE_LIST,
    STATE.CONFIG
  );
  cache.put(request, networkResponse.clone());
  return networkResponse;
}
async function clearAllAPICache() {
  await caches.delete(STATE.CONFIG.CACHE_NAME_API);
  await updateEndpoints(
    Array.from(STATE.CACHE_LIST.keys()),
    STATE.CACHE_LIST,
    STATE.CONFIG
  );
  logger("Updating all endpoints");
}
async function clearAllStaticCache() {
  await caches.delete(STATE.CONFIG.CACHE_NAME_STATIC);
  logger("Cleared static cache");
}
function isCacheExpired(cachedResponse) {
  const cachedMetadata = getCachedMetadata(cachedResponse);
  const currentTime = (/* @__PURE__ */ new Date()).getTime();
  const expiredTime = cachedMetadata?.expired || 0;
  return expiredTime < currentTime;
}
function getCachedMetadata(cachedResponse) {
  const metadataString = cachedResponse.headers.get("X-Cache-Metadata");
  return metadataString ? JSON.parse(metadataString) : null;
}

// src/eventListeners.ts
function initServiceWorker(config) {
  STATE.CONFIG = config;
  if (config.debug) {
    enableLogger();
  }
  setupInstallListener();
  setupActivateListener();
  setupMessageListener(config);
}
function setupInstallListener() {
  swScope.addEventListener("install", () => {
    swScope.skipWaiting();
    logger("Service worker installed and skipped waiting.");
  });
}
function setupActivateListener() {
  swScope.addEventListener("activate", (event) => {
    event.waitUntil(Promise.all([swScope.clients.claim(), clearAllAPICache()]));
    logger("Activated service worker and claimed clients.");
  });
}
function setupMessageListener(config) {
  swScope.addEventListener(
    "message",
    (event) => {
      const action = event.data.action;
      logger("Received message action:", action);
      switch (action) {
        case "pageLoaded":
          handlePageLoaded(event.data, config);
          break;
        case "notifyAll":
          sendEvent(event.data.event);
          break;
        default:
          logger("Unhandled message action:", action);
      }
    }
  );
}
function handlePageLoaded(data, config) {
  const staticPatterns = data.staticPatterns;
  config.DISABLE_STATIC_CACHE = !!data.disableStaticCache;
  config.DISABLE_DYNAMIC_CACHE = !!data.disableDynamicCache;
  config.APP_VERSION = data.version;
  if (staticPatterns && !config.DISABLE_STATIC_CACHE) {
    logger(`Caching static resources by patterns: ${staticPatterns}`);
    STATE.STATIC_RESOURCE_PATTERN = new RegExp(
      staticPatterns.map((regex) => regex.source).join("|")
    );
  }
  if (config.DISABLE_STATIC_CACHE) {
    clearAllStaticCache();
  }
  clearAllAPICache();
}

// src/fetchHandlers.ts
function handleFetchEvent(event) {
  const requestUrl = new URL(event.request.url);
  const ignore = getRequestHeader(
    event.request,
    STATE.CONFIG.CACHE_IGNORE_NAME
  );
  const cacheName = getRequestHeader(
    event.request,
    STATE.CONFIG.CACHE_HEADER_NAME
  );
  logger(`Handling fetch event for: ${event.request.url}`);
  if (ignore) {
    logger(`Request ignored: ${event.request.url}`);
    return;
  }
  const isHtmlRequest = event.request.headers.get("Accept")?.includes("text/html") || requestUrl.pathname.endsWith(".html");
  if (isHtmlRequest || /^chrome-extension:|^ws:|\/runtime\./.test(event.request.url)) {
    logger(`Excluded request: ${event.request.url}`);
    return;
  }
  if (requestUrl.pathname.includes("/api/") && !STATE.CONFIG.DISABLE_DYNAMIC_CACHE) {
    logger(`Processing API request: ${event.request.url}`);
    catchCashableRequests(event.request, STATE.CACHE_LIST, STATE.CONFIG).then(
      () => {
        if (STATE.CACHE_LIST.has(cacheName)) {
          logger(`Serving API response from cache: ${cacheName}`);
          event.respondWith(handleAPICache(event.request, cacheName));
        }
      }
    );
    return;
  }
  if (STATE.STATIC_RESOURCE_PATTERN.test(event.request.url) && event.request.method === "GET" && !STATE.CONFIG.DISABLE_STATIC_CACHE) {
    logger(`Serving static resource from cache: ${event.request.url}`);
    event.respondWith(handleStaticCache(event.request));
    return;
  }
  logger(`No cache strategy applied for request: ${event.request.url}`);
}

// src/service-worker.ts
var CONFIG = {
  debug: true,
  APP_VERSION: "0.0.1",
  CACHE_NAME_STATIC: "static-cache",
  CACHE_NAME_API: "api-cache",
  CACHE_USE_CACHE_NAME: "Sw-Use-Cache",
  CACHE_IGNORE_NAME: "Sw-Cache-Ignore",
  CACHE_HEADER_NAME: "Sw-Cache-Name",
  CACHE_TTL_NAME: "Sw-Cache-Ttl",
  CACHE_DELETE_NAME: "Sw-Cache-Update-For",
  DISABLE_STATIC_CACHE: false,
  DISABLE_DYNAMIC_CACHE: false
};
initServiceWorker(CONFIG);
swScope.addEventListener("fetch", handleFetchEvent);
//# sourceMappingURL=service-worker.js.map
