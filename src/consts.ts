import { SwCacheList, SwCahce } from "./interfaces/cache";
import { SWConfig } from "./interfaces/config";

export const STATE: {
  CONFIG: SWConfig;
  CACHE_LIST: SwCacheList;
} = {
  CONFIG: null,
  CACHE_LIST: new Map<string, SwCahce>(),
};
