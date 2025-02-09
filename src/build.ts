import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { mergeContents } from './content-merger';
import { createEntryContent } from './entry';
import { extractExports, removeExportKeywords } from './exports-handler';

/**
 * Builds the service worker using esbuild to bundle all necessary files
 * based on the provided configuration.
 *
 * @param {object} config - The configuration object loaded from the user's file.
 */
export async function buildServiceWorker(config: { [key: string]: any }) {
  const sourceFilePath = path.resolve(process.cwd(), config.sourcePath);

  if (!fs.existsSync(sourceFilePath)) {
    throw new Error(`Source file not found: ${config.sourcePath}`);
  }

  const tempFile = path.resolve(__dirname, '__temp_merged.ts');

  try {
    // Read and process files
    const entryContent = createEntryContent();
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf-8');

    const exportedItems = extractExports(sourceContent);
    const cleanedSourceContent = removeExportKeywords(sourceContent);

    console.log('\nExported items from source file:', exportedItems);

    // Merge contents
    const mergedContent = mergeContents({
      entryContent,
      sourceContent: cleanedSourceContent,
      exportedItems,
    });

    // Write merged content
    fs.writeFileSync(tempFile, mergedContent);

    // Build with esbuild
    await esbuild.build({
      entryPoints: [tempFile],
      bundle: true,
      minify: Boolean(config.minify),
      sourcemap: Boolean(config.sourcemap),
      outfile: config.target ?? 'service-worker.js',
      target: ['chrome58', 'firefox57'],
      format: 'iife', // Changed to IIFE to ensure proper self context
      platform: 'browser', // Explicitly set browser platform
      conditions: ['worker'], // Add worker condition for proper imports
      define: {
        'process.env.DEBUG': JSON.stringify(config.debug),
        self: 'self', // Ensure self is properly defined
        global: 'self', // Map global to self for service worker context
      },
      loader: {
        '.ts': 'ts',
        '.js': 'js',
      },
      absWorkingDir: process.cwd(),
      alias: {
        'sw-builder': path.resolve(__dirname, './interfaces'),
      },
    });

    console.log(`Service worker built from ${config.sourcePath}`);
  } catch (error) {
    console.error('Error building service worker:', error);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}
