/// <reference types="jest" />

import { readConfigFile } from '../read-file';
import fs from 'fs';
import path from 'path';

describe('readConfigFile', () => {
  const mockConfig = {
    target: './dist/sw.js',
    sourcePath: './src/sw.ts',
    debug: true,
    minify: false,
    sourcemap: false,
  };

  const testDir = path.join(__dirname, 'temp_read-file');
  const jsConfigPath = path.join(testDir, 'config.js');
  const tsConfigPath = path.join(testDir, 'config.ts');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Create test config files with minimal config
    const minimalConfig = {
      target: mockConfig.target,
      sourcePath: mockConfig.sourcePath,
      debug: mockConfig.debug,
    };

    const jsContent = `module.exports = ${JSON.stringify(minimalConfig)}`;
    const tsContent = `export default ${JSON.stringify(minimalConfig)}`;

    fs.writeFileSync(jsConfigPath, jsContent);
    fs.writeFileSync(tsConfigPath, tsContent);
  });

  afterEach(() => {
    // Cleanup test files
    fs.readdirSync(testDir).forEach((file) => {
      fs.unlinkSync(path.join(testDir, file));
    });
  });

  afterAll(() => {
    fs.rmdirSync(testDir);
  });

  it('should read JS config file', () => {
    const config = readConfigFile(jsConfigPath);
    expect(config).toEqual(mockConfig);
  });

  it('should read TS config file', () => {
    const config = readConfigFile(tsConfigPath);
    expect(config).toEqual(mockConfig);
  });

  it('should throw error for invalid config', () => {
    const invalidPath = path.join(testDir, 'invalid.js');
    expect(() => readConfigFile(invalidPath)).toThrow();
  });

  it('should throw error for missing target', () => {
    const invalidConfig = {
      sourcePath: './src/sw.ts',
    };
    const configPath = path.join(testDir, 'invalid-target.js');
    fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(invalidConfig)}`);

    expect(() => readConfigFile(configPath)).toThrow("Configuration must specify 'target' path");
  });

  it('should throw error for missing sourcePath', () => {
    const invalidConfig = {
      target: './dist/sw.js',
    };
    const configPath = path.join(testDir, 'invalid-source.js');
    fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(invalidConfig)}`);

    expect(() => readConfigFile(configPath)).toThrow("Configuration must specify 'sourcePath'");
  });

  it('should handle TypeScript config with ts-node registration', () => {
    const tsConfig = {
      target: './dist/sw.js',
      sourcePath: './src/sw.ts',
      debug: true,
    };
    const configPath = path.join(testDir, 'config.ts');
    fs.writeFileSync(configPath, `export default ${JSON.stringify(tsConfig)}`);

    const config = readConfigFile(configPath);
    expect(config.target).toBe(tsConfig.target);
    expect(config.sourcePath).toBe(tsConfig.sourcePath);
  });

  it('should handle both default and direct exports', () => {
    const jsConfig = {
      target: './dist/sw.js',
      sourcePath: './src/sw.ts',
    };
    const configPath = path.join(testDir, 'direct-export.js');
    fs.writeFileSync(
      configPath,
      `exports.target = ${JSON.stringify(jsConfig.target)};\nexports.sourcePath = ${JSON.stringify(
        jsConfig.sourcePath
      )};`
    );

    const config = readConfigFile(configPath);
    expect(config.target).toBe(jsConfig.target);
    expect(config.sourcePath).toBe(jsConfig.sourcePath);
  });

  it('should handle CommonJS module.exports', () => {
    const jsConfig = {
      target: './dist/sw.js',
      sourcePath: './src/sw.ts',
    };
    const configPath = path.join(testDir, 'commonjs.js');
    fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(jsConfig)};`);

    const config = readConfigFile(configPath);
    expect(config.target).toBe(jsConfig.target);
    expect(config.sourcePath).toBe(jsConfig.sourcePath);
  });

  it('should handle ES module default export', () => {
    const tsConfig = {
      target: './dist/sw.js',
      sourcePath: './src/sw.ts',
    };
    const configPath = path.join(testDir, 'esmodule.ts');
    fs.writeFileSync(configPath, `export default ${JSON.stringify(tsConfig)};`);

    const config = readConfigFile(configPath);
    expect(config.target).toBe(tsConfig.target);
    expect(config.sourcePath).toBe(tsConfig.sourcePath);
  });

  it('should throw error for invalid config object', () => {
    const configPath = path.join(testDir, 'invalid-obj.js');
    fs.writeFileSync(configPath, `module.exports = null;`);

    expect(() => readConfigFile(configPath)).toThrow("Cannot read properties of null (reading 'default')");
  });

  it('should handle config with all options', () => {
    const fullConfig = {
      target: './dist/sw.js',
      sourcePath: './src/sw.ts',
      debug: true,
      minify: true,
      sourcemap: true,
    };
    const configPath = path.join(testDir, 'full-config.js');
    fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(fullConfig)};`);

    const config = readConfigFile(configPath);
    expect(config).toEqual(fullConfig);
  });

  it('should throw error for malformed config file', () => {
    const configPath = path.join(testDir, 'malformed.js');
    fs.writeFileSync(configPath, `this is not valid javascript`);

    expect(() => readConfigFile(configPath)).toThrow();
  });
});
