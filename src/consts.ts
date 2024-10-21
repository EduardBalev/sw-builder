import { SwCache } from "./interfaces/cache";
import { SwState } from "./interfaces/state";

/**
 * The state object of the service worker, holding the configuration, static resource patterns, and cache entries.
 *
 * @constant {SwState} STATE
 */
export const STATE: SwState = {
  CONFIG: null,
  STATIC_RESOURCE_PATTERN: new RegExp(""),
  CACHE_LIST: new Map<string, SwCache>(),
};
