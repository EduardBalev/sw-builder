import { initServiceWorker } from "./eventListeners";
import { handleFetchEvent } from "./fetchHandlers";
import { SWConfig } from "./interfaces/config";
import { swScope } from "./swScope";

// TODO: add some configuration for define consts and setup SW
const CONFIG: SWConfig = {
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
};

initServiceWorker(CONFIG);

swScope.addEventListener("fetch", handleFetchEvent);
