/**
 * Configuration for the service worker setup.
 *
 * @property sourcePath - The path to the source file containing event handlers.
 * @property target - The path to the target file.
 * @property minify - Whether to minify the output.
 * @property sourcemap - Whether to generate a source map.
 * @property debug - Whether to enable debug mode.
 */
export interface SwSetupConfig {
  sourcePath: string; // Path to the source file containing event handlers
  target: string; // Path to the target file
  minify?: boolean; // Minify the output
  sourcemap?: boolean; // Generate a source map
  debug?: boolean; // Enable debug mode
}

/**
 * Configuration part to mirror part of the service worker setup to find the
 * CONFIG object in the project.
 *
 * @property debug - Whether to enable debug mode.
 */
export type SwConfig = Pick<SwSetupConfig, 'debug'>;

/**
 * Default configuration for the service worker setup.
 */
export const CONFIG: SwConfig = {
  debug: false,
};
