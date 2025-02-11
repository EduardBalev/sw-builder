/// <reference types="jest" />

import fs from 'fs';
import path from 'path';
import { buildServiceWorker } from '../build';
import chokidar from 'chokidar';
import { cli } from '../cli';

jest.mock('../build');
jest.mock('fs');
jest.mock('ts-node');
jest.mock('chokidar');

describe('CLI', () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const mockExit = jest.fn();
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    process.argv = [...originalArgv];
    process.exit = mockExit as any;
    (buildServiceWorker as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
  });

  it('should show help text and exit', async () => {
    process.argv = [...originalArgv, '--help'];
    await cli();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should handle config path argument', async () => {
    const testDir = path.join(__dirname, 'temp_cli');
    const configPath = path.join(testDir, 'sw-config.js');
    const mockConfig = {
      target: 'sw.js',
      sourcePath: 'source.ts',
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.doMock(configPath, () => mockConfig, { virtual: true });

    process.argv = [...originalArgv, `--config=${configPath}`];

    await cli();

    expect(buildServiceWorker).toHaveBeenCalled();
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should handle watch mode', async () => {
    const testDir = path.join(__dirname, 'temp_cli');
    const configPath = path.join(testDir, 'sw-config.js');
    const mockConfig = {
      target: 'sw.js',
      sourcePath: 'source.ts',
    };

    const mockWatcher = {
      on: jest.fn(),
    };
    (chokidar.watch as jest.Mock).mockReturnValue(mockWatcher);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.doMock(configPath, () => mockConfig, { virtual: true });

    process.argv = [...originalArgv, `--config=${configPath}`, '--watch'];

    await cli();

    expect(chokidar.watch).toHaveBeenCalledWith([configPath, mockConfig.sourcePath], expect.any(Object));
    expect(mockWatcher.on).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle missing config path', async () => {
    process.argv = [...originalArgv, `--config=`];

    await cli();

    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Please provide a configuration file'));
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle build errors', async () => {
    const configPath = path.join(__dirname, 'sw-config.js');
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    (buildServiceWorker as jest.Mock).mockRejectedValue(new Error('Build failed'));

    process.argv = [...originalArgv, `--config=${configPath}`];

    await cli();

    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle file changes in watch mode', async () => {
    const testDir = path.join(__dirname, 'temp_cli');
    const configPath = path.join(testDir, 'sw-config.js');
    const mockConfig = {
      target: 'sw.js',
      sourcePath: 'source.ts',
    };

    let changeCallback: (path: string) => void;
    const mockWatcher = {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'change') changeCallback = callback;
      }),
    };
    (chokidar.watch as jest.Mock).mockReturnValue(mockWatcher);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.doMock(configPath, () => mockConfig, { virtual: true });

    process.argv = [...originalArgv, `--config=${configPath}`, '--watch'];

    await cli();

    // Simulate file change
    changeCallback!(configPath);
    expect(buildServiceWorker).toHaveBeenCalledTimes(2); // Initial build + rebuild
  });

  it('should show help text when no arguments provided', async () => {
    process.argv = []; // No args
    await cli();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should handle watch mode errors', async () => {
    const testDir = path.join(__dirname, 'temp_cli');
    const configPath = path.join(testDir, 'sw-config.js');
    const mockConfig = {
      target: 'sw.js',
      sourcePath: 'source.ts',
    };

    let changeCallback: (path: string) => void;
    const mockWatcher = {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'change') changeCallback = callback;
      }),
    };
    (chokidar.watch as jest.Mock).mockReturnValue(mockWatcher);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.doMock(configPath, () => mockConfig, { virtual: true });

    process.argv = [...originalArgv, `--config=${configPath}`, '--watch'];
    await cli();

    // Simulate file change with error
    (buildServiceWorker as jest.Mock).mockRejectedValueOnce(new Error('Watch build failed'));
    await changeCallback!(configPath);

    expect(mockConsoleError).toHaveBeenCalledWith('Error:', expect.any(Error));
    expect(mockExit).not.toHaveBeenCalled(); // Should not exit on watch errors
  });
});
