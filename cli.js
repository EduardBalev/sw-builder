#!/usr/bin/env node

const path = require("path");
const { buildServiceWorker } = require("./build");

// Get the config file path from command-line arguments
const args = process.argv.slice(2);
const configFile = args
  .find((arg) => arg.startsWith("--config="))
  ?.split("=")[1];

if (!configFile) {
  console.error(
    "Error: Please provide a configuration file with --config=<path>",
  );
  process.exit(1);
}

const configPath = path.resolve(process.cwd(), configFile);

// Dynamically import the configuration
import(configPath)
  .then((config) => {
    buildServiceWorker(config.default || config);
  })
  .catch((error) => {
    console.error("Error loading configuration:", error);
    process.exit(1);
  });
