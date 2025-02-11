#!/usr/bin/env node

import chokidar from 'chokidar';
import path from 'path';
import { buildServiceWorker } from './build';
import { readConfigFile } from './read-file';

// CLI help text
const helpText = `
wf-builder - Service Worker Builder

Usage:
  wf-builder --config=<path> [options]

Options:
  --config=<path>   Path to config file (required)
  --watch          Watch mode - rebuild on changes
  --help           Show this help message

Example:
  wf-builder --config=sw-config.ts --watch
`;

export * from './interfaces';

/**
 * Main function to parse arguments, load config, and build the service worker.
 */
export const cli = async () => {
  const args = process.argv.slice(2);

  // Show help when no args or --help flag
  if (args.length === 0 || args.includes('--help')) {
    console.log(helpText);
    process.exit(0);
    return;
  }

  const configFile = args.find((arg) => arg.startsWith('--config='))?.split('=')[1];
  const shouldWatch = args.includes('--watch');

  if (!configFile) {
    console.error('Error: Please provide a configuration file with --config=<path>');
    process.exit(1);
    return; // Early return
  }

  const configPath = path.resolve(process.cwd(), configFile);
  let config;

  try {
    config = readConfigFile(configPath);
    await buildServiceWorker(config);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  // Watch mode
  if (shouldWatch && config) {
    console.log('\x1b[34mWatching for changes...\x1b[0m');
    const watcher = chokidar.watch([configPath, config.sourcePath], {
      persistent: true,
    });

    watcher.on('change', async (path) => {
      console.log(`\x1b[33mFile changed: ${path}\x1b[0m`);
      try {
        config = readConfigFile(configPath);
        await buildServiceWorker(config);
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
};
