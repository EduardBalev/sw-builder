#!/usr/bin/env node

import path from 'path';
import chokidar from 'chokidar';
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
async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.length === 0) {
    console.log(helpText);
    process.exit(0);
  }

  const configFile = args.find((arg) => arg.startsWith('--config='))?.split('=')[1];
  const shouldWatch = args.includes('--watch');

  if (!configFile) {
    console.error('Error: Please provide a configuration file with --config=<path>');
    process.exit(1);
  }

  const configPath = path.resolve(process.cwd(), configFile);

  async function build() {
    try {
      const config = readConfigFile(configPath);
      await buildServiceWorker(config);
      console.log(`\x1b[32mService worker built successfully to \x1b[3m'${config.target}'\x1b[0m`);
      return config;
    } catch (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
  }

  // Initial build
  const config = await build();

  // Watch mode
  if (shouldWatch) {
    console.log('\x1b[34mWatching for changes...\x1b[0m');
    const watcher = chokidar.watch([configPath, config.sourcePath], {
      persistent: true,
    });

    watcher.on('change', async (path) => {
      console.log(`\x1b[33mFile changed: ${path}\x1b[0m`);
      await build();
    });
  }
}

// Run the main function
main().catch(console.error);
