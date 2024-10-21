import { SwCacheList } from "./cache";
import { SWConfig } from "./config";

/**
 * Represents the state of the service worker, including configuration, static resource patterns, and cache entries.
 *
 * @interface SwState
 *
 * @property {SWConfig} CONFIG - The configuration settings for the service worker, defining caching strategies and other options.
 * @property {RegExp} STATIC_RESOURCE_PATTERN - The regular expression used to match static resources for caching.
 * @property {SwCacheList} CACHE_LIST - A map that holds cache entries, with cache names as keys and cache metadata as values.
 */
export interface SwState {
  CONFIG: SWConfig;
  STATIC_RESOURCE_PATTERN: RegExp;
  CACHE_LIST: SwCacheList;
}
