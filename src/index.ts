#!/usr/bin/env node

import path from "path";
import chokidar from "chokidar";
import { buildServiceWorker } from "./build";
import { readConfigFile } from "./read-file";

export { SwSetupConfig } from "./config";

/**
 * Main function to parse arguments, load config, and build the service worker.
 */
async function main() {
  const configFile = getConfigFilePath();
  const shouldWatch = process.argv.includes("--watch");
  if (!configFile) {
    console.error(
      "Error: Please provide a configuration file with --config=<path>",
    );
    process.exit(1);
  }

  const entryPoint = resolveEntryPoint("../builder/src/index.ts");
  const configPath = path.resolve(process.cwd(), configFile);

  async function build() {
    try {
      const config = readConfigFile(configPath);

      await buildServiceWorker(config, entryPoint);
      console.log(
        `\x1b[32mService worker built successfully to \x1b[3m'${config.target}'\x1b[0m`,
      );
    } catch (error) {
      console.error(
        "Error loading configuration or building service worker:",
        error,
      );
      process.exit(1);
    }
  }

  // Initial build
  await build();

  // If `--watch` flag is present, set up file watching
  if (shouldWatch) {
    console.log(
      `\x1b[3m\x1b[34mWatching for changes in ${configPath}...\x1b[0m`,
    );
    const watcher = chokidar.watch(configPath, { persistent: true });

    watcher.on("change", async () => {
      console.log(
        "\x1b[3m\x1b[33mConfig file changed. Rebuilding service worker...\x1b[0m",
      );
      await build();
    });
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
