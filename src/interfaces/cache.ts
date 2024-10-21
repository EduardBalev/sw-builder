export interface SwCahce {
  name: string;
  ttl: number;
  updateTimestamp?: number;
}

export type SwCacheList = Map<string, SwCahce>;
