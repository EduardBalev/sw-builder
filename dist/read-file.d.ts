import { SwSetupConfig } from "./config";
/**
 * Reads a configuration file of various types and returns its contents.
 * Supports .js and .ts file types.
 *
 * @param {string} configPath - The path to the configuration file.
 * @returns {SwSetupConfig} - The parsed configuration object.
 */
export declare function readConfigFile(configPath: string): SwSetupConfig;
