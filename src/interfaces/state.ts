import { APICacheStrategy } from "../cache-strategies/api-cache.strategy";
import { StaticCacheStrategy } from "../cache-strategies/static-cache.strategy";
import { SwCacheList } from "./cache";
import { SWConfig } from "./config";

/**
 * Represents the state of the service worker, including configuration, caching strategies, and cache entries.
 *
 * @interface SwState
 *
 * @property {SWConfig} CONFIG - The configuration settings for the service worker, defining caching strategies and other options.
 * @property {Object} STRATEGIES - The caching strategies used by the service worker.
 * @property {APICacheStrategy} STRATEGIES.apiCache - The strategy used for handling API requests.
 * @property {StaticCacheStrategy} STRATEGIES.staticCache - The strategy used for handling static resource requests.
 * @property {SwCacheList} CACHE_LIST - A map that holds cache entries, with cache names as keys and cache metadata as values.
 */
export interface SwState {
  CONFIG: SWConfig;
  STRATEGIES: {
    apiCache: APICacheStrategy;
    staticCache: StaticCacheStrategy;
  };
  CACHE_LIST: SwCacheList;
}
