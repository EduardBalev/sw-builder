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
function matchesPattern(url, patterns) {
  return patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return url.includes(pattern);
    } else {
      return pattern.test(url);
    }
  });
}
function toCapitalizedString(input) {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

// src/cache-strategies/api-cache.strategy.ts
var APICacheStrategy = class {
  cacheName;
  cacheList;
  config;
  /**
   * Constructs the APICacheStrategy class.
   *
   * @param {string} cacheName - The name of the cache used for API requests.
   * @param {SwCacheList} cacheList - A map of cache metadata used to manage API cache entries.
   * @param {SWConfig} config - The service worker configuration.
   */
  constructor(cacheName, cacheList, config) {
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
  async handle(request) {
    const cache = await caches.open(this.config.CACHE_NAME_API);
    const cachedResponse = await cache.match(request);
    const meta = this.cacheList.get(this.cacheName);
    const now = Date.now();
    const updateTimestamp = meta?.updateTimestamp ?? now;
    const isManuallyUpdated = updateTimestamp < now;
    logger(`Handling API request for: ${request.url}`);
    if (cachedResponse && !isManuallyUpdated && !this.isCacheExpired(cachedResponse)) {
      logger(`API Cache hit: ${request.url}`);
      return cachedResponse;
    }
    if (cachedResponse) {
      logger(`API Cache outdated - deleting cached entry: ${request.url}`);
      await cache.delete(request);
      if (meta) {
        meta.updateTimestamp = null;
      }
    }
    logger(`API Cache miss - fetching from network: ${request.url}`);
    const networkResponse = await fetchAndCache(
      request,
      this.cacheList,
      this.config
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
  async clear() {
    logger("Clearing API cache...");
    await caches.delete(this.config.CACHE_NAME_API);
    await updateEndpoints(
      Array.from(this.cacheList.keys()),
      this.cacheList,
      this.config
    );
    logger("API cache cleared and endpoints updated.");
  }
  /**
   * Checks if the cached response has expired.
   *
   * @param {Response} cachedResponse - The cached response to check.
   * @returns {boolean} - True if the cache has expired, false otherwise.
   */
  isCacheExpired(cachedResponse) {
    const cachedMetadata = this.getCachedMetadata(cachedResponse);
    const currentTime = Date.now();
    const expiredTime = cachedMetadata?.expired || 0;
    const isExpired = expiredTime < currentTime;
    logger(
      `Cache expiration check for ${cachedResponse.url}: ${isExpired ? "Expired" : "Valid"}`
    );
    return isExpired;
  }
  /**
   * Extracts cache metadata from the cached response headers.
   *
   * @param {Response} cachedResponse - The cached response to extract metadata from.
   * @returns {any} - The parsed metadata or null if no metadata is available.
   */
  getCachedMetadata(cachedResponse) {
    const metadataString = cachedResponse.headers.get("X-Cache-Metadata");
    logger(`Extracting cache metadata for ${cachedResponse.url}`);
    return metadataString ? JSON.parse(metadataString) : null;
  }
};

// src/cache-strategies/static-cache.strategy.ts
var StaticCacheStrategy = class {
  cacheName;
  /**
   * Constructs the StaticCacheStrategy class.
   *
   * @param {string} cacheName - The name of the cache used for static resources.
   */
  constructor(cacheName) {
    this.cacheName = cacheName;
  }
  /**
   * Handles a static resource request by either serving from the cache or fetching from the network.
   *
   * @param {Request} request - The static resource request to be handled.
   * @returns {Promise<Response>} - The cached response or the network response.
   */
  async handle(request) {
    const cache = await caches.open(this.cacheName);
    const cachedResponse = await cache.match(request);
    logger(`Handling static resource request for: ${request.url}`);
    if (cachedResponse) {
      logger(`STATIC Cache hit: ${request.url}`);
      return cachedResponse;
    }
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
  async clear() {
    logger(`Clearing static cache: ${this.cacheName}`);
    await caches.delete(this.cacheName);
    logger(`Static cache cleared: ${this.cacheName}`);
  }
};

// src/consts.ts
var STATE = {
  CONFIG: null,
  STRATEGIES: {
    apiCache: null,
    staticCache: null
  },
  CACHE_LIST: /* @__PURE__ */ new Map()
};

// src/fetchHandlers.ts
function initFetchHandlers(strategies) {
  logger("Initializing caching strategies...");
  logger("Caching strategies initialized successfully.");
  swScope.addEventListener("fetch", (event) => {
    logger(`Fetch event detected for: ${event.request.url}`);
    handleFetchEvent(event, strategies.apiCache, strategies.staticCache);
  });
  logger("Fetch event listener attached.");
}
function handleFetchEvent(event, apiCacheStrategy, staticCacheStrategy) {
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
    logger(
      `Request ignored due to CACHE_IGNORE_NAME header: ${event.request.url}`
    );
    return;
  }
  if (matchesPattern(requestUrl.href, STATE.CONFIG.EXCLUDE_PATTERNS)) {
    logger(`Request excluded: ${event.request.url}`);
    return;
  }
  if (matchesPattern(requestUrl.pathname, STATE.CONFIG.API_PATTERNS) && !STATE.CONFIG.DISABLE_DYNAMIC_CACHE) {
    logger(`Processing API request: ${event.request.url}`);
    catchCashableRequests(event.request, STATE.CACHE_LIST, STATE.CONFIG).then(
      () => {
        if (STATE.CACHE_LIST.has(cacheName)) {
          logger(`Serving API response from cache: ${cacheName}`);
          event.respondWith(apiCacheStrategy.handle(event.request));
        }
      }
    );
    return;
  }
  if (matchesPattern(requestUrl.href, STATE.CONFIG.STATIC_RESOURCE_PATTERN) && event.request.method === "GET" && !STATE.CONFIG.DISABLE_STATIC_CACHE) {
    logger(`Serving static resource from cache: ${event.request.url}`);
    event.respondWith(staticCacheStrategy.handle(event.request));
    return;
  }
  logger(`No cache strategy applied for request: ${event.request.url}`);
}

// src/eventListeners.ts
function initServiceWorker(config) {
  STATE.CONFIG = config;
  STATE.CONFIG.EXCLUDE_PATTERNS = [
    ...STATE.CONFIG.EXCLUDE_PATTERNS ?? [],
    /^chrome-extension:/,
    /^ws:/,
    /\/runtime\./
  ];
  STATE.STRATEGIES.apiCache = new APICacheStrategy(
    STATE.CONFIG.CACHE_NAME_API,
    STATE.CACHE_LIST,
    STATE.CONFIG
  );
  STATE.STRATEGIES.staticCache = new StaticCacheStrategy(
    STATE.CONFIG.CACHE_NAME_STATIC
  );
  if (config.debug) {
    enableLogger();
  }
  initFetchHandlers(STATE.STRATEGIES);
  setupInstallListener();
  setupActivateListener(STATE);
  setupMessageListener(STATE);
}
function setupInstallListener() {
  swScope.addEventListener("install", () => {
    swScope.skipWaiting();
    logger("Service worker installed and skipped waiting.");
  });
}
function setupActivateListener(state) {
  swScope.addEventListener("activate", (event) => {
    event.waitUntil(
      Promise.all([swScope.clients.claim(), state.STRATEGIES.apiCache.clear()])
    );
    logger("Activated service worker and claimed clients.");
  });
}
function setupMessageListener(state) {
  swScope.addEventListener(
    "message",
    (event) => {
      const action = event.data.action;
      logger("Received message action:", action);
      switch (action) {
        case "pageLoaded":
          handlePageLoaded(event.data, state);
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
function handlePageLoaded(data, state) {
  state.CONFIG.APP_VERSION = data.version;
  if (state.CONFIG.DISABLE_STATIC_CACHE) {
    state.STRATEGIES.staticCache.clear();
  }
  state.STRATEGIES.apiCache.clear();
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
  DISABLE_DYNAMIC_CACHE: false,
  STATIC_RESOURCE_PATTERN: [
    /\.js$/,
    /\.css$/,
    /\/assets\//,
    /\/translations\//
  ],
  EXCLUDE_PATTERNS: [/^chrome-extension:/, /^ws:/, /\/runtime\./],
  API_PATTERNS: [/\/api\//]
};
initServiceWorker(CONFIG);
//# sourceMappingURL=service-worker.js.map
