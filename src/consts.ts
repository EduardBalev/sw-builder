import { SwCache } from "./interfaces/cache";
import { SwState } from "./interfaces/state";

/**
 * The state object of the service worker, holding the configuration, static resource patterns, and cache entries.
 *
 * @constant {SwState} STATE
 */
export const STATE: SwState = {
  CONFIG: null,
  STRATEGIES: {
    apiCache: null,
    staticCache: null,
  },
  CACHE_LIST: new Map<string, SwCache>(),
};
