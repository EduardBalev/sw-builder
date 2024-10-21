import { clearAllAPICache, clearAllStaticCache } from "./cache";
import { STATE } from "./consts";
import { SWConfig } from "./interfaces/config";
import { PageLoadedEventData } from "./interfaces/event-data";
import { NotifyAllEventData } from "./interfaces/notify-data";
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

  if (config.debug) {
    enableLogger();
  }

  setupInstallListener();
  setupActivateListener();
  setupMessageListener(config); // Passing config to message listener directly
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
function setupActivateListener() {
  swScope.addEventListener("activate", (event) => {
    event.waitUntil(Promise.all([swScope.clients.claim(), clearAllAPICache()]));
    logger("Activated service worker and claimed clients.");
  });
}

/**
 * Sets up the message event listener to handle specific actions like page load and notifications.
 *
 * @param {SWConfig} config - The service worker configuration.
 */
function setupMessageListener(config: SWConfig) {
  swScope.addEventListener(
    "message",
    (event: { data: PageLoadedEventData | NotifyAllEventData }) => {
      const action = event.data.action;
      logger("Received message action:", action);

      switch (action) {
        case "pageLoaded":
          handlePageLoaded(event.data as PageLoadedEventData, config);
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
 * @param {SWConfig} config - The service worker configuration.
 */
function handlePageLoaded(data: PageLoadedEventData, config: SWConfig) {
  const staticPatterns = data.staticPatterns;
  config.DISABLE_STATIC_CACHE = !!data.disableStaticCache;
  config.DISABLE_DYNAMIC_CACHE = !!data.disableDynamicCache;
  config.APP_VERSION = data.version;

  if (staticPatterns && !config.DISABLE_STATIC_CACHE) {
    logger(`Caching static resources by patterns: ${staticPatterns}`);
    STATE.STATIC_RESOURCE_PATTERN = new RegExp(
      staticPatterns.map((regex) => regex.source).join("|"),
    );
  }

  if (config.DISABLE_STATIC_CACHE) {
    clearAllStaticCache();
  }

  clearAllAPICache();
}
