/// <reference types="jest" />

import fs from 'fs';
import path from 'path';
import { buildServiceWorker } from '../build';
import { SwSetupConfig } from '../interfaces/config';
import { cleanupTempFiles } from './helpers/test-utils';

describe('buildServiceWorker', () => {
  const testDir = path.join(__dirname, 'temp');
  const sourcePath = path.join(testDir, 'test-source.ts');
  const targetPath = path.join(testDir, 'service-worker.js');

  const mockConfig: SwSetupConfig = {
    sourcePath,
    target: targetPath,
    debug: true,
  };

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Create a test source file with multiple exports and imports
    const sourceContent = `
      import { someUtil } from './utils';
      import type { CustomType } from './types';
      import { SW, CONFIG } from 'sw-builder';
      
      export const onInstall = (event) => {
        console.log('Installing', CONFIG.debug);
        if (CONFIG.debug) {
          console.log('Debug mode enabled');
        }

        SW.skipWaiting();
      };

      export const onActivate = (event) => {
        console.log('Activating', CONFIG.debug);
      };

      export const onFetch = (event) => {
        someUtil();
        console.log('Fetching', CONFIG.debug);
      };

      export type TestType = string;
    `;
    fs.writeFileSync(sourcePath, sourceContent);

    // Create mock utility file
    const utilsPath = path.join(testDir, 'utils.ts');
    fs.writeFileSync(
      utilsPath,
      `
      export function someUtil() {
        if (CONFIG.debug) {
          console.log('util');
        }
      };
    `
    );
  });

  afterEach(() => {
    fs.readdirSync(testDir).forEach((file) => {
      fs.unlinkSync(path.join(testDir, file));
    });
  });

  afterAll(() => {
    cleanupTempFiles();
  });

  it('should build service worker file with all configurations', async () => {
    const fullConfig: SwSetupConfig = {
      ...mockConfig,
      minify: true,
      sourcemap: true,
      debug: true,
    };

    await buildServiceWorker(fullConfig);
    expect(fs.existsSync(targetPath)).toBe(true);

    const content = fs.readFileSync(targetPath, 'utf8');
    expect(content).toContain('self');
    expect(content).toContain('addEventListener');
    expect(content).toContain('console.log');
    expect(content).toContain('Installing');
  });

  it('should handle multiple event handlers', async () => {
    await buildServiceWorker(mockConfig);
    const content = fs.readFileSync(targetPath, 'utf8');

    expect(content).toContain('onInstall');
    expect(content).toContain('onActivate');
    expect(content).toContain('onFetch');
    expect(content).toContain('registerEvent');
  });

  it('should properly inline imported files', async () => {
    await buildServiceWorker(mockConfig);
    const content = fs.readFileSync(targetPath, 'utf8');

    expect(content).toContain('someUtil');
    expect(content).not.toContain('import');
    expect(content).not.toContain('export');
  });

  it('should handle minification when enabled', async () => {
    const minifyConfig = { ...mockConfig, minify: true };
    await buildServiceWorker(minifyConfig);

    const content = fs.readFileSync(targetPath, 'utf8');
    console.log(content.split('\n').length);

    expect(content.split('\n').length).toBeLessThan(20); // Minified should be compact
  });

  it('should generate sourcemap when enabled', async () => {
    const sourcemapConfig = { ...mockConfig, sourcemap: true };
    await buildServiceWorker(sourcemapConfig);

    const content = fs.readFileSync(targetPath, 'utf8');
    expect(content).toMatch(/\/\/# sourceMappingURL=.*\.map/);
  });

  it('should throw error for non-existent source file', async () => {
    const invalidConfig = { ...mockConfig, sourcePath: 'non-existent.ts' };
    await expect(buildServiceWorker(invalidConfig)).rejects.toThrow();
  });

  it('should handle empty exports', async () => {
    fs.writeFileSync(sourcePath, '// Empty file');
    const emptyConfig = { ...mockConfig, debug: true };
    await buildServiceWorker(emptyConfig);

    const content = fs.readFileSync(targetPath, 'utf8');
    expect(content).toContain('(() => {\n})();\n');
  });

  it('should handle debug mode properly', async () => {
    const debugConfig = { ...mockConfig, debug: true };
    await buildServiceWorker(debugConfig);

    const content = fs.readFileSync(targetPath, 'utf8');
    expect(content).toMatch(/const\s+CONFIG\s*=\s*{\s*debug:\s*true\s*}/);
    expect(content).toContain('console.log');
  });
});
