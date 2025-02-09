import { hooksMap } from './interfaces';
import { callRegisterEvent } from './entry/register-event';

interface MergeOptions {
  /** The content of the entry point file */
  entryContent: string;
  /** The processed source content (with exports removed) */
  sourceContent: string;
  /** Set of exported items from the source file */
  exportedItems: Set<string>;
}

/**
 * Creates a mapping of service worker events to their handler functions
 * based on what was exported from the source file.
 * Only includes hooks that were actually exported by the user.
 *
 * @param exportedItems - Set of items exported from the source file
 * @returns Record mapping event names to their handler functions
 */
export function getRegisteredHooks(exportedItems: Set<string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(hooksMap)
      .filter(([, value]) => exportedItems.has(value))
      .map(([key, value]) => [key, value])
  );
}

/**
 * Merges the entry point and source content into a single file.
 * The resulting file will:
 * 1. Include the entry point code
 * 2. Include the source code without exports
 * 3. Register all available hooks with their respective event listeners
 *
 * This creates a self-contained service worker file that can be built by esbuild.
 *
 * @param options - Options for merging content
 * @returns The merged content ready for building
 */
export function mergeContents({ entryContent, sourceContent, exportedItems }: MergeOptions): string {
  const registeredHooks = getRegisteredHooks(exportedItems);

  return `
    // Entry point content
    ${entryContent}

    // Source file content
    ${sourceContent}   

    // Initialize HOOKS
    ${Object.entries(registeredHooks)
      .map(([key, value]) => callRegisterEvent(key, value))
      .join('\n')}
  `;
}
