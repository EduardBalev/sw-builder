const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

/**
 * Builds the service worker using esbuild to bundle all necessary files
 * based on the provided configuration.
 *
 * @param {object} config - The configuration object loaded from the user's file.
 */
function buildServiceWorker(config) {
  const entryPoint = path.resolve(__dirname, "src/index.ts"); // Main entry point for the service worker

  // Generate a temporary injected config file with real functions
  const injectedConfigPath = path.resolve(__dirname, "injectedConfig.js");
  const configContent =
    `export const EVENTS = ${JSON.stringify(config.events, functionReplacer("+fff+"))};`
      .replace(
        /"\+fff\+(\(.*?\)\s*=>\s*{?.*?}?|function\s*\(.*?\)\s*{?.*?})\+fff\+"/g,
        "$1",
      )
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "")
      .trim();

  fs.writeFileSync(injectedConfigPath, configContent);

  return esbuild
    .build({
      entryPoints: [entryPoint],
      bundle: true,
      outfile: config.target ?? "service-worker.js",
      // define: {
      //   CONFIG: JSON.stringify(config),
      // },
      inject: [injectedConfigPath],
      target: ["chrome58", "firefox57"], // Set target environments if needed
      format: "esm", // Use ESM format for compatibility
    })

    .then(() => {
      console.log("Service worker built successfully.");
      fs.unlinkSync(injectedConfigPath); // Clean up the temp file
    })
    .catch((error) => {
      console.error("Error building service worker:", error);
      fs.unlinkSync(injectedConfigPath); // Clean up the temp file
    });
}

/**
 * Custom replacer for JSON.stringify to handle functions.
 * Converts functions to their string representations.
 */
function functionReplacer(fnBorder) {
  return function (key, value) {
    if (typeof value === "function") {
      return `${fnBorder}${value.toString()}${fnBorder}`;
    }
    return value;
  };
}

module.exports = { buildServiceWorker };
