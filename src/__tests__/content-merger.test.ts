/// <reference types="jest" />

import fs from 'fs';
import { mergeContents } from '../content-merger';

jest.mock('fs');

describe('content-merger', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should handle non-existent import files', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = mergeContents({
      sourceContent: 'import { test } from "./non-existent";',
      exportedItems: new Set(),
      sourcePath: 'test.ts',
      config: { debug: true },
    });

    expect(result).toContain('const SW = self');
    expect(result).not.toContain('import');
  });

  it('should resolve TypeScript files', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => p.toString().endsWith('.ts'));
    jest.spyOn(fs, 'readFileSync').mockReturnValue('export const test = 123;');

    const result = mergeContents({
      sourceContent: 'import { test } from "./util";',
      exportedItems: new Set(),
      sourcePath: 'test.ts',
      config: { debug: true },
    });

    expect(result).toContain('const test = 123');
  });

  it('should not duplicate declarations from imports', () => {
    // Mock file system to return content for imported file
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => p.toString().endsWith('.ts'));
    jest.spyOn(fs, 'readFileSync').mockReturnValue(`
      export const CACHE_NAME = "v1";
      export let CACHE_NAME_2 = "v2";
      export const OBJECT_NAME = {
        name: "John",
        age: 30,
      };
    `);

    const result = mergeContents({
      sourceContent: `
        import { CACHE_NAME } from "./constants";
        
        CACHE_NAME_2 = "v3";
        self.addEventListener('activate', () => {
          OBJECT_NAME.age = 31;
          caches.delete(CACHE_NAME);
        });
      `,
      exportedItems: new Set(),
      sourcePath: 'test.ts',
      config: { debug: false },
    });

    // Should only contain one declaration
    const matches = result.match(/const CACHE_NAME/g) || [];
    expect(matches.length).toBe(1);
    expect(result).toContain('const CACHE_NAME = "v1"');
    expect(result).toContain('caches.delete(CACHE_NAME)');
    expect(result).toContain('CACHE_NAME_2 = "v3"');
    expect(result).toContain('OBJECT_NAME.age = 31');
  });

  it('should handle multiple imports using same constant', () => {
    const configContent = 'export const API_URL = "https://api.example1.com";';
    const constantsContent = 'export let API_URL = "https://api.example2.com";';

    jest.spyOn(fs, 'existsSync').mockImplementation((p) => p.toString().endsWith('.ts'));
    jest.spyOn(fs, 'readFileSync').mockImplementation((p) => {
      if (p.toString().includes('config')) return configContent;
      if (p.toString().includes('constants')) return constantsContent;
      return '';
    });

    const result = mergeContents({
      sourceContent: `
        import { API_URL } from "./config";
        import { API_URL as BaseUrl } from "./constants";

        self.addEventListener('fetch', () => {
          console.log(API_URL, BaseUrl);
          fetch(API_URL + '/data');
        });
      `,
      exportedItems: new Set(),
      sourcePath: 'test.ts',
      config: { debug: false },
    });

    // Should only declare the constant once
    const matches = result.match(/const API_URL/g) || [];

    expect(matches.length).toBe(1);
    expect(result).toContain('const API_URL = "https://api.example1.com"');
    expect(result).toContain('let BaseUrl = "https://api.example2.com"');
    expect(result).toContain("fetch(API_URL + '/data')");
  });

  it('should not contain any export keywords in output', () => {
    const result = mergeContents({
      sourceContent: `
        export const VERSION = "1.0.0";
        export function init() {
          console.log('init');
        }
        export default class Service {
          run() {}
        }
      `,
      exportedItems: new Set(),
      sourcePath: 'test.ts',
      config: { debug: false },
    });

    expect(result).not.toContain('export const');
    expect(result).not.toContain('export function');
    expect(result).not.toContain('export default');
    expect(result).not.toContain('export {');
    expect(result).toContain('const VERSION = "1.0.0"');
    expect(result).toContain('function init()');
    expect(result).toContain('class Service');
  });

  it('should handle nested imports correctly', () => {
    // Create mock files in memory
    const mockFiles = new Map([
      [
        'source.ts',
        `
        import { helperA, helperA2 } from "./a";
        import {
          directC,
          directC2
        } from "./utils";
        
        self.addEventListener('fetch', () => {
          helperA();
          helperA2();
          directC();
          directC2();
        });
      `,
      ],
      [
        'a.ts',
        `
        import { helperB } from "./b";
        export const helperA = () => {
          console.log("A helper");
          helperB();
        };
        export const helperA2 = () => {
          console.log("A helper 2");
        };
      `,
      ],
      [
        'b.ts',
        `
        import { helperC, directC as _directC } from "./utils";
        export function helperB() {
          console.log("B helper");
          helperC();
          _directC();
        };
      `,
      ],
      [
        'utils.ts',
        `
        export const helperC = () => {
          console.log("C helper");
        };
        export async function directC() {
          console.log("Direct C");
        };
        export function directC2() {
          console.log("Direct C 2");
        };
      `,
      ],
    ]);

    // Mock the file system operations
    jest.spyOn(fs, 'existsSync').mockImplementation((path) => {
      const fileName = path.toString().split('/').pop();
      return mockFiles.has(fileName!);
    });

    jest.spyOn(fs, 'readFileSync').mockImplementation((path: fs.PathOrFileDescriptor) => {
      const fileName = path.toString().split('/').pop();
      return mockFiles.get(fileName!) || '';
    });

    const result = mergeContents({
      sourceContent: mockFiles.get('source.ts')!,
      exportedItems: new Set(),
      sourcePath: 'source.ts',
      config: { debug: false },
    });

    // Verify all helper functions are present
    expect(result).toContain('helperA = () =>');
    expect(result).toContain('helperA2 = () =>');
    expect(result).toContain('function helperB()');
    expect(result).toContain('helperC = () =>');
    expect(result).toContain('async function directC()');
    expect(result).toContain('function directC2()');

    // Verify imports are removed
    expect(result).not.toContain('import {');
    console.log(result);

    // Verify function declarations are preserved
    expect(result).toContain('console.log("A helper")');
    expect(result).toContain('console.log("A helper 2")');
    expect(result).toContain('console.log("B helper")');
    expect(result).toContain('console.log("C helper")');
    expect(result).toContain('console.log("Direct C")');
    expect(result).toContain('console.log("Direct C 2")');

    // Restore mocks
    jest.restoreAllMocks();
  });

  it('should handle circular dependencies correctly', () => {
    // Create mock files with circular imports
    const mockFiles = new Map([
      [
        'source.ts',
        `
        import { componentA } from "./a";
        
        self.addEventListener('fetch', () => {
          componentA();
        });
        `,
      ],
      [
        'a.ts',
        `
        import { componentB } from "./b";
        export const componentA = () => {
          console.log("Component A");
          componentB();
        };
        `,
      ],
      [
        'b.ts',
        `
        import { componentA } from "./a";  // Circular import
        export const componentB = () => {
          console.log("Component B");
          // Try to use componentA
          if (Math.random() > 0.5) {
            componentA();
          }
        };
        `,
      ],
    ]);

    // Mock the file system operations
    jest.spyOn(fs, 'existsSync').mockImplementation((path) => {
      const fileName = path.toString().split('/').pop();
      return mockFiles.has(fileName!);
    });

    jest.spyOn(fs, 'readFileSync').mockImplementation((path: fs.PathOrFileDescriptor) => {
      const fileName = path.toString().split('/').pop();
      return mockFiles.get(fileName!) || '';
    });

    const result = mergeContents({
      sourceContent: mockFiles.get('source.ts')!,
      exportedItems: new Set(),
      sourcePath: 'source.ts',
      config: { debug: false },
    });

    // Verify components are present
    expect(result).toContain('componentA = () =>');
    expect(result).toContain('componentB = () =>');

    // Verify function declarations are preserved
    expect(result).toContain('console.log("Component A")');
    expect(result).toContain('console.log("Component B")');

    // Verify each component is only declared once
    const componentAMatches = result.match(/componentA\s*=/g) || [];
    const componentBMatches = result.match(/componentB\s*=/g) || [];
    expect(componentAMatches.length).toBe(1);
    expect(componentBMatches.length).toBe(1);

    // Restore mocks
    jest.restoreAllMocks();
  });
});
