import fs from 'fs';
import path from 'path';
import { createEntryContent } from './entry';
import { callRegisterEvent } from './entry/register-event';
import { hooksMap } from './interfaces';
import { SwConfig } from './interfaces/config';

// Track processed files to prevent circular imports
const processedFiles = new Set<string>();

/**
 * Options for merging service worker content
 * @interface MergeOptions
 */
interface MergeOptions {
  /** The processed source content (with exports removed) */
  sourceContent: string;
  /** Set of exported items from the source file */
  exportedItems: Set<string>;
  /** The path to the source file */
  sourcePath: string;
  /** Service worker configuration */
  config: SwConfig;
}

/**
 * Resolves and reads the content of an imported file
 *
 * @param {string} importPath - The path of the file to import (as specified in import statement)
 * @param {string} fromPath - The path of the file containing the import
 * @returns {string} The content of the imported file or empty string if not found
 */
function resolveImport(importPath: string, fromPath: string): string {
  const absolutePath = path.resolve(path.dirname(fromPath), importPath);
  if (fs.existsSync(absolutePath + '.ts')) {
    return fs.readFileSync(absolutePath + '.ts', 'utf-8');
  }
  if (fs.existsSync(absolutePath)) {
    return fs.readFileSync(absolutePath, 'utf-8');
  }
  return '';
}

/**
 * Resets the processed files tracking
 */
function resetProcessedFiles() {
  processedFiles.clear();
}

/**
 * Processes and inlines all imports in the given content
 *
 * @param {string} content - The source content containing imports to process
 * @param {string} filePath - The path of the file being processed
 * @returns {string} Content with all imports inlined and type imports removed
 */
function inlineImports(content: string, filePath: string): string {
  // Skip if we've already processed this file
  if (processedFiles.has(filePath)) {
    return '';
  }
  processedFiles.add(filePath);

  // Remove type imports first
  content = content.replace(/import\s+type\s+.*?from\s+['"][^'"]+['"];?/g, '');

  // Track imported variables and their values
  const importedVars = new Map<string, { keyword: string; value: string }>();
  let importedContents: string[] = []; // Changed to array to store all imported contents

  // Process named imports with potential aliases
  content = content.replace(/import\s*{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/g, (match, imports, importPath) => {
    // Get imported content for this specific import
    const currentContent = handleImport(importPath, filePath);
    if (!currentContent) return '';

    // Store the content for later use
    importedContents.push(currentContent);

    // Process each imported item
    imports.split(',').forEach((imp) => {
      const [original, alias] = imp.trim().split(/\s+as\s+/);
      if (alias) {
        // Extract declaration for the original variable
        const exec = new RegExp(`(const|let|var|function)\\s+${original.trim()}\\s*=\\s*(.+?);`).exec(currentContent);
        if (exec) {
          const [, keyword, value] = exec;
          importedVars.set(alias.trim(), { keyword, value });
        }
      }
    });
    return ''; // Remove the import statement
  });

  function test() {
    console.log('test');
  }

  test();

  // Process default imports
  content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, (match, importName, importPath) => {
    const newContent = handleImport(importPath, filePath);
    if (newContent) {
      importedContents.push(newContent);
    }
    return '';
  });

  // Combine all imported contents with aliases and the original content
  if (importedContents.length > 0) {
    const aliasDefs = Array.from(importedVars.entries())
      .map(([alias, { keyword, value }]) => {
        if (keyword === 'function') {
          return `${keyword} ${alias}${value.substring(value.indexOf('('))}`;
        }
        return `${keyword} ${alias} = ${value};`;
      })
      .join('\n');

    return `${importedContents.join('\n ')}\n${aliasDefs}\n${content}`;
  }
  return content;
}

function handleImport(importPath: string, filePath: string): string {
  // Don't process imports from sw-builder package
  if (importPath.includes('@simple_js/sw-builder')) return '';

  const importedContent = resolveImport(importPath, filePath);
  if (!importedContent) return '';

  const absolutePath = path.resolve(path.dirname(filePath), importPath);
  return inlineImports(importedContent, absolutePath);
}

/**
 * Removes export keywords from content while preserving declarations
 *
 * @param {string} content - The content to process
 * @returns {string} Content with export keywords removed
 */
function removeExports(content: string): string {
  return (
    content
      // Remove 'export default' from class/function declarations
      .replace(/export\s+default\s+(class|function)\s+/g, '$1 ')
      // Remove 'export default' from other expressions
      .replace(/export\s+default\s+/g, '')
      // Remove 'export' from const/let/var/function/class declarations
      .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
      // Remove 'export' from named exports
      .replace(/export\s*{[^}]*}/g, '')
      // Remove any remaining standalone 'export' keywords
      .replace(/^\s*export\s+/gm, '')
  );
}

/**
 * Merges all service worker components into a single file
 *
 * This function:
 * 1. Adds the SW global and CONFIG object
 * 2. Includes the entry point code
 * 3. Inlines all dependencies from the source file
 * 4. Registers service worker event handlers
 *
 * The resulting file is a self-contained service worker that:
 * - Has no external dependencies
 * - Has all imports inlined
 * - Has proper event handler registration
 * - Has access to the SW global object
 *
 * @param {MergeOptions} options - Options for merging content
 * @param {string} options.sourceContent - The source file content
 * @param {Set<string>} options.exportedItems - Set of exported items from source
 * @param {string} options.sourcePath - Path to the source file
 * @param {SwConfig} options.config - Service worker configuration
 * @returns {string} The complete service worker content
 */
export function mergeContents({ sourceContent, exportedItems, sourcePath, config }: MergeOptions): string {
  // Reset the processed files tracking
  resetProcessedFiles();

  // Get all registered hooks that were exported from source
  const registeredHooks = Object.entries(hooksMap)
    .filter(([, value]) => exportedItems.has(value))
    .map(([key, value]) => callRegisterEvent(key, value))
    .join('\n');

  // Process and inline all imports
  const inlinedContent = inlineImports(sourceContent, sourcePath);

  // Remove export keywords
  const processedContent = removeExports(inlinedContent);
  const entryContent = createEntryContent(config);

  // Always include entry content, even for empty files
  return `
    /* Service Worker generated by sw-builder */
    ${entryContent}

    // Inlined dependencies and source content
    ${processedContent}

    // Register hooks
    ${registeredHooks}
  `.trim(); // Trim to remove extra whitespace
}
