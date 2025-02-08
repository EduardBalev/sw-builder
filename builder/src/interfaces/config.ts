import { CachePolicy } from './cache-policies';

export declare interface SWConfig {
  /** Flag to enable or disable debug mode in the service worker. */
  debug?: boolean;
  cachePolicies: {
    staticResources: CachePolicy;
    apiResponses: CachePolicy;
  };
}

// Declare `CONFIG` as a global constant of type `SWConfig`
export declare const CONFIG: SWConfig;
export declare const HOOKS: Record<string, Function>;
