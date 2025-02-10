/**
 * Post-build script to modify the service worker type definition file.
 * This script adds the WebWorker type reference to the generated sw.d.ts file
 * to ensure proper TypeScript type checking in the service worker context.
 *
 * @module scripts/postbuild
 */

const fs = require('fs');
const path = require('path');

// Path to the service worker type definition file
const swDtsPath = path.resolve(__dirname, '../dist/interfaces/sw.d.ts');

try {
  // Read the current content of the type definition file
  const content = fs.readFileSync(swDtsPath, 'utf8');

  // Add WebWorker type reference directive at the beginning of the file
  const updatedContent = `/// <reference lib="webworker" />\n\n${content}`;

  // Write the updated content back to the file
  fs.writeFileSync(swDtsPath, updatedContent);
  console.log('\x1b[32mAdded webworker reference to sw.d.ts\x1b[0m');
} catch (error) {
  console.error('\x1b[31mFailed to update sw.d.ts:\x1b[0m', error);
  process.exit(1);
}
