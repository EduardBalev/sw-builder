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
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => (p as string).endsWith('.ts'));
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
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => (p as string).endsWith('.ts'));
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
    const constantContent = 'export const API_URL = "https://api.example.com";';

    jest.spyOn(fs, 'existsSync').mockImplementation((p) => (p as string).endsWith('.ts'));
    jest.spyOn(fs, 'readFileSync').mockReturnValue(constantContent);

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
    expect(result).toContain('const API_URL = "https://api.example.com"');
    expect(result).toContain('const BaseUrl = "https://api.example.com"');
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
});
