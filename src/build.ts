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

  const tempFile = path.resolve(__dirname, '.temp.service-worker.bundle.ts');

  try {
    const entryContent = createEntryContent(config);
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf-8');
    const exportedItems = extractExports(sourceContent);
    const cleanedSourceContent = removeExportKeywords(sourceContent);

    const mergedContent = mergeContents({
      entryContent,
      sourceContent: cleanedSourceContent,
      exportedItems,
      sourcePath: sourceFilePath,
    });

    // Write pure browser code
    const browserCode = mergedContent;

    // Write directly to the target file
    const compiledCode = await esbuild.transform(browserCode, {
      loader: 'ts',
      target: 'chrome58',
      format: 'iife',
      minify: Boolean(config.minify),
      sourcemap: Boolean(config.sourcemap),
      charset: 'utf8',
    });

    fs.writeFileSync(config.target, compiledCode.code);

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
