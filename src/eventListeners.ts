import { APICacheStrategy } from "./cache-strategies/api-cache.strategy";
import { StaticCacheStrategy } from "./cache-strategies/static-cache.strategy";
import { STATE } from "./consts";
import { initFetchHandlers } from "./fetchHandlers";
import { SWConfig } from "./interfaces/config";
import { PageLoadedEventData } from "./interfaces/event-data";
import { NotifyAllEventData } from "./interfaces/notify-data";
import { SwState } from "./interfaces/state";
import { enableLogger, logger } from "./logger";
import { swScope } from "./swScope";
import { sendEvent } from "./utils";

/**
 * Initializes the service worker with the provided configuration and sets up event listeners.
 *
 * @param {SWConfig} config - The service worker configuration.
 */
export function initServiceWorker(config: SWConfig) {
  STATE.CONFIG = config;

  // Set defaults
  STATE.CONFIG.EXCLUDE_PATTERNS = [
    ...(STATE.CONFIG.EXCLUDE_PATTERNS ?? []),
    /^chrome-extension:/,
    /^ws:/,
    /\/runtime\./,
  ];

  // Initialize caching strategies
  STATE.STRATEGIES.apiCache = new APICacheStrategy(
    STATE.CONFIG.CACHE_NAME_API,
    STATE.CACHE_LIST,
    STATE.CONFIG,
  );
  STATE.STRATEGIES.staticCache = new StaticCacheStrategy(
    STATE.CONFIG.CACHE_NAME_STATIC,
  );

  if (config.debug) {
    enableLogger();
  }

  initFetchHandlers(STATE.STRATEGIES);
  setupInstallListener();
  setupActivateListener(STATE);
  setupMessageListener(STATE); // Passing config to message listener directly
}

/**
 * Sets up the install event listener to skip waiting and activate immediately.
 */
function setupInstallListener() {
  swScope.addEventListener("install", () => {
    swScope.skipWaiting();
    logger("Service worker installed and skipped waiting.");
  });
}

/**
 * Sets up the activate event listener to claim clients and clear the API cache.
 */
function setupActivateListener(state: SwState) {
  swScope.addEventListener("activate", (event) => {
    event.waitUntil(
      Promise.all([swScope.clients.claim(), state.STRATEGIES.apiCache.clear()]),
    );
    logger("Activated service worker and claimed clients.");
  });
}

/**
 * Sets up the message event listener to handle specific actions like page load and notifications.
 *
 * @param {SwState} state - The service worker state.
 */
function setupMessageListener(state: SwState) {
  swScope.addEventListener(
    "message",
    (event: { data: PageLoadedEventData | NotifyAllEventData }) => {
      const action = event.data.action;
      logger("Received message action:", action);

      switch (action) {
        case "pageLoaded":
          handlePageLoaded(event.data as PageLoadedEventData, state);
          break;
        case "notifyAll":
          sendEvent((event.data as NotifyAllEventData).event);
          break;
        default:
          logger("Unhandled message action:", action);
      }
    },
  );
}

/**
 * Handles the "pageLoaded" action, updates the service worker configuration, and caches static resources.
 *
 * @param {PageLoadedEventData} data - The data associated with the page load event.
 * @param {SwState} state - The service worker state.
 */
function handlePageLoaded(data: PageLoadedEventData, state: SwState) {
  state.CONFIG.APP_VERSION = data.version;

  if (state.CONFIG.DISABLE_STATIC_CACHE) {
    state.STRATEGIES.staticCache.clear();
  }

  state.STRATEGIES.apiCache.clear();
}
