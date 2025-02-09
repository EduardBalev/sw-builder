/// <reference lib="webworker" />

import { SwEventName } from './events';

/**
 * Type for the Service Worker global scope, excluding event handlers
 * that will be managed through our hook system
 */
export type Sw = Omit<ServiceWorkerGlobalScope, `on${SwEventName}`>;

/**
 * Service Worker global scope, safely handled for both runtime and build time
 */
export const SW: Sw = (typeof self !== 'undefined' ? self : {}) as Sw;
