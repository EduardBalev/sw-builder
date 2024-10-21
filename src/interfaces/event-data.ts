/**
 * Represents the data sent to the service worker when the page is loaded.
 *
 * This data structure is used to update the service worker's configuration,
 * manage static and dynamic caching, and cache static resources based on
 * specified patterns. It is dispatched when the main page signals that it
 * has fully loaded.
 */
export interface PageLoadedEventData {
  /** The action identifier for the page loaded event. */
  action: "pageLoaded";

  /** Array of regular expressions representing static resource patterns to be cached. */
  staticPatterns: RegExp[];

  /** Flag indicating whether static caching should be disabled. */
  disableStaticCache: boolean;

  /** Flag indicating whether dynamic caching should be disabled. */
  disableDynamicCache: boolean;

  /** The version of the application or service worker. */
  version: string;

  /** Flag indicating if the version should be checked for updates. */
  checkVersion: boolean;
}

/**
 * Represents the data sent to the service worker to trigger an update for all endpoints.
 *
 * This event is used to instruct the service worker to update all cached API endpoints
 * or related resources. It is a simple event carrying an action identifier.
 */
export interface UpdateAllEndpointsEventData {
  /** The action identifier for the update all endpoints event. */
  action: "updateAllEndpoints";
}
