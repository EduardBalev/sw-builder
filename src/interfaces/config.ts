export interface SWConfig {
  debug: boolean;

  APP_VERSION: string;
  CACHE_USE_CACHE_NAME: string;
  CACHE_NAME_STATIC: string;
  CACHE_NAME_API: string;
  CACHE_IGNORE_NAME: string;
  CACHE_HEADER_NAME: string;
  CACHE_TTL_NAME: string;
  CACHE_DELETE_NAME: string;

  DISABLE_STATIC_CACHE: boolean;
  DISABLE_DYNAMIC_CACHE: boolean;
}
