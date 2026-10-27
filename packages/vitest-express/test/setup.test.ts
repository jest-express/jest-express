import { afterEach, describe, expect, test, vi } from 'vitest';

const factoryKey = Symbol.for('express-mock-core.mockFactory');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('vitest-express', () => {
  test('importing the package configures vi.fn without globals or creating mocks', async () => {
    Reflect.deleteProperty(globalThis, factoryKey);
    vi.stubGlobal('vi', undefined);
    vi.stubGlobal('jest', undefined);
    const fn = vi.spyOn(vi, 'fn');
    try {
      vi.resetModules();
      const { default: express, createRequest, createResponse } = await import('../src');

      expect(fn).not.toHaveBeenCalled();
      const app = express();
      const req = createRequest();
      const res = createResponse();
      for (const mock of [app.get, app.next, req.get, res.status]) {
        expect(vi.isMockFunction(mock)).toBe(true);
      }
      expect(res.status(201)).toBe(res);
    } finally {
      fn.mockRestore();
    }
  });

  test('re-exports the whole express-mock-core API', async () => {
    const core = await import('express-mock-core');
    const wrapper = await import('../src');

    expect(Object.keys(wrapper).sort()).toEqual(Object.keys(core).sort());
    expect(wrapper.default).toBe(core.default);
  });
});
