import path from 'path';
import { SwSetupConfig } from './interfaces';

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
  const ext = path.extname(configPath);

  try {
    let config;
    switch (ext) {
      case '.js':
        config = readJavaScriptConfig(configPath);
        break;
      case '.ts':
        config = readTypeScriptConfig(configPath);
        break;
      default:
        throw new Error('Unsupported config file extension. Supported types: .js, .ts');
    }

    return validateConfig(config);
  } catch (error) {
    console.error('Error reading configuration file:', error);
    process.exit(1);
  }
}

/**
 * Reads a JavaScript configuration file.
 *
 * @param {string} configPath - The path to the .js config file.
 * @returns {SwSetupConfig} - The parsed configuration object.
 */
function readJavaScriptConfig(configPath: string): SwSetupConfig {
  delete require.cache[require.resolve(configPath)]; // Clear cache to allow fresh read
  return require(configPath).default || require(configPath);
}

/**
 * Reads a TypeScript configuration file using ts-node.
 *
 * @param {string} configPath - The path to the .ts config file.
 * @returns {SwSetupConfig} - The parsed configuration object.
 */
function readTypeScriptConfig(configPath: string): SwSetupConfig {
  require('ts-node').register(); // Enable TypeScript support at runtime
  delete require.cache[require.resolve(configPath)];
  return require(configPath).default || require(configPath);
}
