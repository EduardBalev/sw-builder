export interface CachePolicy {
  /** Options: cache-first, network-first, stale-while-revalidate */
  strategy: "cache-first" | "network-first" | "stale-while-revalidate";

  /** Time in seconds before the cache is considered stale  */
  maxAgeSeconds: number;

  /** Optional: maximum number of entries allowed  */
  maxEntries?: number;
}
