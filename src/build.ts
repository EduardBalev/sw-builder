import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { mergeContents } from './content-merger';
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

  try {
    // Prepare content
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf-8');
    const exportedItems = extractExports(sourceContent);
    const cleanedContent = removeExportKeywords(sourceContent);

    // Merge and compile
    const mergedContent = mergeContents({
      sourceContent: cleanedContent,
      exportedItems,
      sourcePath: sourceFilePath,
      config,
    });

    const { code, map } = await esbuild.transform(mergedContent, {
      loader: 'ts',
      target: 'chrome58',
      format: 'iife',
      minify: Boolean(config.minify),
      sourcemap: Boolean(config.sourcemap),
      sourcefile: config.sourcePath,
      charset: 'utf8',
    });

    // Write the main file
    fs.writeFileSync(config.target, code);

    // Write sourcemap if enabled
    if (config.sourcemap && map) {
      const mapPath = `${config.target}.map`;
      fs.writeFileSync(mapPath, map);

      // Append sourcemap link to the end of the file
      fs.appendFileSync(config.target, `\n//# sourceMappingURL=${path.basename(mapPath)}`);
    }

    console.log(`\x1b[32mService worker built successfully to \x1b[3m'${config.target}'\x1b[0m`);
  } catch (error) {
    console.error('\x1b[31mBuild failed:\x1b[0m', error);
  }
}
