/**
 * Service worker self initialization and type declarations.
 * This code sets up the basic environment for the service worker.
 */
// declare const SW: ServiceWorkerGlobalScope = self;
export const globalDeclarations = `
  /// <reference lib="webworker" />
  
  
  const HOOKS = {} as any;
  `;
