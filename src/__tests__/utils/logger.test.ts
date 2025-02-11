/// <reference types="jest" />

import { addLogger } from '../../utils/logger';

describe('logger', () => {
  it('should add logger when debug is true', () => {
    const result = addLogger({ debug: true }, "'test'");
    expect(result).toContain('console.log');
    expect(result).toContain('test');
  });

  it('should not add logger when debug is false', () => {
    const result = addLogger({ debug: false }, "'test'");
    expect(result).toBe('');
  });
});
