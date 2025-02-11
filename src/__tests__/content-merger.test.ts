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
});
