/// <reference lib="webworker" />

/**
 * Casts the global `self` object to the `ServiceWorkerGlobalScope` type.
 *
 * In TypeScript, the `self` object, which represents the global scope in a service worker, is by default typed as `Window & typeof globalThis`.
 * This means that TypeScript will treat `self` as a standard window object, not as a service worker global scope. To use service worker-specific
 * properties like `clients`, `skipWaiting()`, or event listeners such as `onfetch`, we need to cast `self` to the correct type.
 *
 * This ensures that the service worker-specific APIs and properties are available in a type-safe manner without TypeScript errors.
 *
 * @constant {ServiceWorkerGlobalScope} swScope - A correctly typed reference to the service worker's global scope.
 */
export const swScope = self as unknown as ServiceWorkerGlobalScope;
