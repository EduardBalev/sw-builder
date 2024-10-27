const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

/**
 * Builds the service worker using esbuild to bundle all necessary files
 * based on the provided configuration.
 *
 * @param {object} config - The configuration object loaded from the user's file.
 */
async function buildServiceWorker(config) {
  const entryPoint = path.resolve(__dirname, "src/index.ts"); // Main entry point for the service worker
  const injectedConfigPath = path.resolve(__dirname, "__injectedConfig.js"); // Path for temporary injected config

  try {
    // Generate the temporary config file
    createInjectedConfigFile(config, injectedConfigPath);

    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      minify: Boolean(config.minify), // Enable minification for smaller file size
      sourcemap: Boolean(config.sourcemap), // Enable source map generation
      outfile: config.target ?? "service-worker.js",
      inject: [injectedConfigPath],
      target: ["chrome58", "firefox57"], // Set target environments if needed
      format: "esm", // Use ESM format for compatibility
    });
    console.log("Service worker built successfully.");
  } catch (error) {
    console.error("Error building service worker:", error);
  } finally {
    // Clean up the temporary config file
    cleanupInjectedConfigFile(injectedConfigPath);
  }
}

/**
 * Creates a temporary config file for esbuild injection.
 *
 * @param {object} config - The configuration object.
 * @param {string} filePath - The path where the temporary config file should be created.
 */
function createInjectedConfigFile(config, filePath) {
  const configContent = generateConfigContent(config);
  fs.writeFileSync(filePath, configContent);
}

/**
 * Generates the content for the injected config file.
 *
 * @param {object} config - The configuration object.
 * @returns {string} - The generated config content.
 */
function generateConfigContent(config) {
  const configObjectString = JSON.stringify({ debug: config.debug });
  const eventsString = JSON.stringify(config.events, customStringifyReplacer())
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "")
    .trim()
    .slice(1, -1); // Remove surrounding braces

  return `export const CONFIG = ${configObjectString}; export const EVENTS = ${eventsString};`;
}

/**
 * Cleans up the temporary config file.
 *
 * @param {string} filePath - The path to the temporary config file.
 */
function cleanupInjectedConfigFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Custom replacer function for JSON.stringify that converts functions
 * to their string representations and handles objects and arrays properly.
 *
 * @returns {Function} A custom replacer function for JSON.stringify.
 */
function customStringifyReplacer() {
  return function (key, value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Convert the object to a string representation
      return objectToString(value);
    }
    // Convert arrays and other types to strings
    return arrayOrValueToString(value);
  };
}

/**
 * Converts an object to a string representation where each key-value pair
 * is converted to a string. Handles nested structures.
 *
 * @param {Object} obj - The object to convert to a string.
 * @returns {string} A string representation of the object.
 */
function objectToString(obj) {
  const keys = Object.keys(obj);
  const str = keys
    .map((key) => `${key}: ${arrayOrValueToString(obj[key])}`)
    .join(", ");
  return `{${str}}`;
}

/**
 * Converts an array or a non-object value to a string representation.
 * If the value is an array, each element is converted to a string.
 * If the value is a function, it is converted to its string representation.
 *
 * @param {any} value - The value to convert to a string.
 * @returns {string} A string representation of the array or value.
 */
function arrayOrValueToString(value) {
  if (Array.isArray(value)) {
    // Convert each array element to a string
    const str = value.map((item) => functionToString(item)).join(", ");
    return `[${str}]`;
  }
  // Convert non-array values (including functions) to a string
  return functionToString(value);
}

/**
 * Converts a function to its string representation if it is a function,
 * otherwise returns the original value.
 *
 * @param {any} value - The value to convert to a string if it is a function.
 * @returns {string} The string representation of the function or the original value.
 */
function functionToString(value) {
  if (typeof value === "function") {
    return value.toString();
  }
  return JSON.stringify(value); // Use JSON.stringify for other types
}

module.exports = { buildServiceWorker };
