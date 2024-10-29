#!/usr/bin/env node

const path = require("path");
const { colorText } = require("@simple_js/log-styler");
const { buildServiceWorker } = require("./cli/build");
const { readConfigFile } = require("./cli/read-file");

/**
 * Main function to parse arguments, load config, and build the service worker.
 */
async function main() {
  const configFile = getConfigFilePath();
  if (!configFile) {
    console.error(
      "Error: Please provide a configuration file with --config=<path>",
    );
    process.exit(1);
  }

  try {
    const entryPoint = resolveEntryPoint("src/index.ts");
    const configPath = path.resolve(process.cwd(), configFile);
    const configContent = readConfigFile(configPath);
    const config = configContent.default || configContent;

    await buildServiceWorker(config, entryPoint);
    console.log(
      colorText(
        `Service worker built successfully to '${config.target}'`,
        "green",
        "italic",
      ),
    );
  } catch (error) {
    console.error(
      "Error loading configuration or building service worker:",
      error,
    );
    process.exit(1);
  }
}

/**
 * Parses command-line arguments to find the config file path.
 * @returns {string | null} - The config file path or null if not found.
 */
function getConfigFilePath() {
  const args = process.argv.slice(2);
  return args.find((arg) => arg.startsWith("--config="))?.split("=")[1] || null;
}

/**
 * Resolves the main entry point for the service worker.
 * @param {string} relativePath - The relative path to the entry point.
 * @returns {string} - The resolved absolute path to the entry point.
 */
function resolveEntryPoint(relativePath) {
  return path.resolve(__dirname, relativePath);
}

// Run the main function
main();
