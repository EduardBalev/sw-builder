/// <reference lib="webworker" />

import { SwEventName } from 'sw-builder';

const debug = false;

export type Sw = Omit<ServiceWorkerGlobalScope, `on${SwEventName}`>;
export const SW: Sw =
  globalThis.self ??
  (debug
    ? {
        ...globalThis,
        skipWaiting: () => {
          console.log('skipWaiting');
        },
        addEventListener: (eventName, fn) => {
          console.log('addEventListener', eventName, fn);
          fn({ event: eventName });
        },
      }
    : ({} as any));
