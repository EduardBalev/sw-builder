/// <reference types="jest" />

import { SW } from '../../interfaces/sw';

describe('SW', () => {
  const originalSelf = global.self;

  beforeEach(() => {
    // Need to recreate SW with new self value
    jest.isolateModules(() => {
      global.self = { test: true } as any;
      require('../../interfaces/sw');
    });
  });

  afterEach(() => {
    global.self = originalSelf;
    jest.resetModules();
  });

  it('should use self when available', () => {
    const { SW } = require('../../interfaces/sw');
    expect(SW).toEqual({ test: true });
  });

  it('should use empty object when self is undefined', () => {
    jest.isolateModules(() => {
      global.self = undefined;
      const { SW } = require('../../interfaces/sw');
      expect(SW).toEqual({});
    });
  });
});
