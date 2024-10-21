/**
 * Represents the configuration settings for the service worker.
 *
 * This interface defines the various settings and options that control the behavior
 * of the service worker, such as caching strategies, versioning, and debugging options.
 * The configuration includes names for caches, cache control headers, and flags for
 * enabling or disabling specific types of caching.
 */
export interface SWConfig {
  /** Flag to enable or disable debug mode in the service worker. */
  debug: boolean;

  /** The version of the application or service worker. */
  APP_VERSION: string;

  /** The name of the cache header used to determine which cache to use. */
  CACHE_USE_CACHE_NAME: string;

  /** The name of the cache for static resources. */
  CACHE_NAME_STATIC: string;

  /** The name of the cache for API requests. */
  CACHE_NAME_API: string;

  /** The header name used to determine if a request should ignore the cache. */
  CACHE_IGNORE_NAME: string;

  /** The header name used to specify the cache name for a particular request. */
  CACHE_HEADER_NAME: string;

  /** The header name used to specify the Time-To-Live (TTL) for cached items. */
  CACHE_TTL_NAME: string;

  /** The header name used to specify which cached items should be deleted or updated. */
  CACHE_DELETE_NAME: string;

  /** Flag to disable caching of static resources. */
  DISABLE_STATIC_CACHE: boolean;

  /** Flag to disable dynamic caching, typically for API requests. */
  DISABLE_DYNAMIC_CACHE: boolean;
}
