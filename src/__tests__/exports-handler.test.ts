/// <reference types="jest" />

import { extractExports, removeExportKeywords } from '../exports-handler';

describe('exports-handler', () => {
  describe('extractExports', () => {
    it('should extract function exports', () => {
      const content = 'export function test1() {}\nexport const test2 = () => {}';
      const exports = extractExports(content);
      expect(exports).toContain('test1');
      expect(exports).toContain('test2');
    });

    it('should extract named exports', () => {
      const content = 'const test1 = 1;\nfunction test2() {}\nexport { test1, test2 as alias }';
      const exports = extractExports(content);
      expect(exports).toContain('test1');
      expect(exports).toContain('test2');
    });
  });

  describe('removeExportKeywords', () => {
    it('should remove export keywords', () => {
      const content = 'export const test1 = 1;\nexport function test2() {}\nexport { test3, test4 as alias };';
      const cleaned = removeExportKeywords(content);
      expect(cleaned).toBe('const test1 = 1;\nfunction test2() {}\n');
    });

    it('should handle type exports', () => {
      const content = 'export type Test = string;\nexport interface ITest {}';
      const cleaned = removeExportKeywords(content);
      expect(cleaned).toBe('type Test = string;\ninterface ITest {}');
    });
  });
});
