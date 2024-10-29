/**
 * Builds the service worker using esbuild to bundle all necessary files
 * based on the provided configuration.
 *
 * @param {object} config - The configuration object loaded from the user's file.
 */
export declare function buildServiceWorker(config: {
    [key: string]: any;
}, entryPoint: string): Promise<void>;
