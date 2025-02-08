import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { hooksMap } from './hooks';

/**
 * Extracts exported items from source content
 */
function extractExports(sourceContent: string): Set<string> {
  const exports = new Set<string>();

  // Match different export patterns
  const exportPatterns = [
    // export const/function/class name
    /export\s+(const|function|class|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g,
    // export { name1, name2 }
    /export\s*{([^}]*)}/g,
  ];

  // Extract direct exports (const/function/class)
  let matches = sourceContent.matchAll(exportPatterns[0]);
  for (const match of matches) {
    exports.add(match[2]);
  }

  // Extract exports from blocks
  matches = sourceContent.matchAll(exportPatterns[1]);
  for (const match of matches) {
    match[1]
      .split(',')
      .map((name) => name.trim().split(' as ')[0]) // Handle "export { x as y }"
      .filter((name) => name.length > 0)
      .forEach((name) => exports.add(name));
  }

  return exports;
}

/**
 * Removes export keywords while keeping the actual code
 */
function removeExportKeywords(sourceContent: string): string {
  return (
    sourceContent
      // Remove 'export' from declarations
      .replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ')
      // Remove export blocks entirely (since we'll register them later)
      .replace(/^export\s*{[^}]*};?\s*$/gm, '')
      // Remove 'export default'
      .replace(/^export\s+default\s+/gm, '')
      // Remove 'export type'
      .replace(/^export\s+type\s+/gm, 'type ')
  );
}

/**
 * Builds the service worker using esbuild to bundle all necessary files
 * based on the provided configuration.
 *
 * @param {object} config - The configuration object loaded from the user's file.
 */
export async function buildServiceWorker(config: { [key: string]: any }, entryPoint: string) {
  // Verify source file exists
  const sourceFilePath = path.resolve(process.cwd(), config.sourcePath);

  if (!fs.existsSync(sourceFilePath)) {
    throw new Error(`Source file not found: ${config.sourcePath}`);
  }

  // Create a temporary merged file
  const tempFile = path.resolve(__dirname, '__temp_merged.ts');
  const tempDir = path.dirname(tempFile);

  try {
    // Read both files
    const entryContent = fs.readFileSync(entryPoint, 'utf-8');
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf-8');

    // Extract exports and remove export keywords
    const exportedItems = extractExports(sourceContent);
    const cleanedSourceContent = removeExportKeywords(sourceContent);

    console.log('\nExported items from source file:');
    console.log(exportedItems);

    // Calculate relative paths for imports
    const entryDir = path.dirname(entryPoint);
    const relativeImportBase = path.relative(tempDir, entryDir);

    // Update import paths in entry content
    const updatedEntryContent = entryContent.replace(
      /(from\s+['"])\.\.?\/(.*?)(['"])/g,
      (match, start, importPath, end) => `${start}${path.join(relativeImportBase, importPath)}${end}`
    );

    const registeredHooks = Object.fromEntries(
      Object.entries(hooksMap)
        .filter(([, value]) => exportedItems.has(value))
        .map(([key, value]) => [key, value])
    );

    // Merge the contents
    const mergedContent = `
    // Entry point content
    ${updatedEntryContent}

    // Source file content
    ${cleanedSourceContent}   

    // Initialize HOOKS
    ${Object.entries(registeredHooks)
      .map(([key, value]) => `// Register ${key} event\nregisterEvent("${key}", ${value});`)
      .join('\n')}
    `;

    // Write the merged content to temp file
    fs.writeFileSync(tempFile, mergedContent);

    await esbuild.build({
      entryPoints: [tempFile],
      bundle: true,
      minify: Boolean(config.minify),
      sourcemap: Boolean(config.sourcemap),
      outfile: config.target ?? 'service-worker.js',
      target: ['chrome58', 'firefox57'],
      format: 'esm',
      define: {
        'process.env.DEBUG': JSON.stringify(config.debug),
      },
      loader: {
        '.ts': 'ts',
        '.js': 'js',
      },
      absWorkingDir: process.cwd(), // Set working directory for resolving imports
    });

    console.log(`Service worker built from ${config.sourcePath}`);
  } catch (error) {
    console.error('Error building service worker:', error);
    process.exit(1);
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}
