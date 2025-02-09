import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { mergeContents } from './content-merger';
import { createEntryContent } from './entry';
import { extractExports, removeExportKeywords } from './exports-handler';
import { SwSetupConfig } from './interfaces/config';

/**
 * Builds the service worker using esbuild to bundle all necessary files
 * based on the provided configuration.
 *
 * @param {object} config - The configuration object loaded from the user's file.
 */
export async function buildServiceWorker(config: SwSetupConfig) {
  const sourceFilePath = path.resolve(process.cwd(), config.sourcePath);

  if (!fs.existsSync(sourceFilePath)) {
    throw new Error(`Source file not found: ${config.sourcePath}`);
  }

  const tempFile = path.resolve(__dirname, '__temp_merged.ts');

  try {
    // Read and process files
    const entryContent = createEntryContent(config);
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
        'sw-builder': path.resolve(__dirname, './interfaces/public-api.ts'),
      },
    });

    console.log(`Service worker built successfully: ${config.target}`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}
