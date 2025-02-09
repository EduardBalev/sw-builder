import { registerEventListenerFn } from './register-event';
import { globalDeclarations } from './global-declarations';
import { SwConfig } from '../interfaces/config';

/**
 * Creates the entry point content for the service worker.
 * Combines the self initialization code and event registration functionality.
 *
 * The entry content includes:
 * 1. Service worker self initialization and type declarations
 * 2. Event registration function for handling service worker events
 *
 * @returns The complete entry point content as a string
 */
export function createEntryContent(config: SwConfig): string {
  return `
    ${globalDeclarations(config)}
    ${registerEventListenerFn(config)}
  `;
}
