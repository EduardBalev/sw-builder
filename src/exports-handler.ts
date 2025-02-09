/**
 * Extracts all exported items from the source code content.
 * Handles different export patterns:
 * - Direct exports (export function/const/class)
 * - Named exports (export { name1, name2 })
 * - Aliased exports (export { name1 as alias1 })
 *
 * @param sourceContent - The source file content to analyze
 * @returns A Set of exported item names
 */
export function extractExports(sourceContent: string): Set<string> {
  const exports = new Set<string>();
  const exportPatterns = [
    // export const/function/class name
    /export\s+(const|function|class|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g,
    // export { name1, name2 }
    /export\s*{([^}]*)}/g,
  ];

  // Extract direct exports
  let matches = sourceContent.matchAll(exportPatterns[0]);
  for (const match of matches) {
    exports.add(match[2]);
  }

  // Extract exports from blocks
  matches = sourceContent.matchAll(exportPatterns[1]);
  for (const match of matches) {
    match[1]
      .split(',')
      .map((name) => name.trim().split(' as ')[0])
      .filter((name) => name.length > 0)
      .forEach((name) => exports.add(name));
  }

  return exports;
}

/**
 * Removes all export keywords from the source code while preserving the actual code.
 * This is needed because the code will be merged into a single file where exports are not needed.
 * Handles:
 * - Regular exports (export function/const/class)
 * - Export blocks (export { ... })
 * - Default exports (export default)
 * - Type exports (export type)
 *
 * @param sourceContent - The source code to clean
 * @returns The source code with export keywords removed
 */
export function removeExportKeywords(sourceContent: string): string {
  return (
    sourceContent
      // Remove 'export' from declarations
      .replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ')
      // Remove export blocks entirely
      .replace(/^export\s*{[^}]*};?\s*$/gm, '')
      // Remove 'export default'
      .replace(/^export\s+default\s+/gm, '')
      // Remove 'export type'
      .replace(/^export\s+type\s+/gm, 'type ')
  );
}
