import { register } from 'ts-node';
import { SwSetupConfig } from './interfaces/config';

/**
 * Validates the configuration object
 */
function validateConfig(config: any): SwSetupConfig {
  if (!config.target) {
    throw new Error("Configuration must specify 'target' path");
  }
  if (!config.sourcePath) {
    throw new Error("Configuration must specify 'sourcePath' for event handlers");
  }

  return {
    target: config.target,
    minify: Boolean(config.minify),
    sourcemap: Boolean(config.sourcemap),
    debug: Boolean(config.debug),
    sourcePath: config.sourcePath,
  };
}

/**
 * Reads a configuration file of various types and returns its contents.
 * Supports .js and .ts file types.
 *
 * @param {string} configPath - The path to the configuration file.
 * @returns {SwSetupConfig} - The parsed configuration object.
 */
export function readConfigFile(configPath: string): SwSetupConfig {
  try {
    // Register ts-node for TypeScript files
    if (configPath.endsWith('.ts')) {
      register({
        compilerOptions: {
          module: 'commonjs',
          moduleResolution: 'node',
        },
      });
    }

    // Try to load the config
    const config = require(configPath);
    return validateConfig(config.default || config);
  } catch (error) {
    console.error('Error reading configuration file:', error);
    throw error;
  }
}
