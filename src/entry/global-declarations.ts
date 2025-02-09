/**
 * Service worker self initialization and type declarations.
 * This code sets up the basic environment for the service worker.
 */

import { SwConfig } from '../interfaces/config';

// declare const SW: ServiceWorkerGlobalScope = self;
export const globalDeclarations = (config: SwConfig) => `
  /// <reference lib="webworker" />
  
  declare const self: ServiceWorkerGlobalScope;
  declare const CONFIG: { debug: boolean };
  CONFIG.debug = ${config.debug};
  
  // Initialize hooks container
  const HOOKS: Record<string, Function> = {};
`;
