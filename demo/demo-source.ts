import type { ActivateHandler, FetchHandler, InstallHandler } from 'sw-builder';
import { SW, CONFIG } from 'sw-builder';

// Example source file (sw-source.ts)
export const onInstall: InstallHandler = (event) => {
  console.log('Service Worker installing');
  // Installation logic

  console.log('Example using config', CONFIG);

  SW.skipWaiting();
};

export const onActivate: ActivateHandler = (event) => {
  console.log('Service Worker activating');
  // Activation logic

  event.waitUntil(SW.clients.claim());
};

export const onFetch: FetchHandler = (event) => {
  console.log('Handling fetch event');
  // Fetch handling logic
};
