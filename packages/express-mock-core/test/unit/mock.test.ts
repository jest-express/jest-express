import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Express } from '../../src/express';
import { configure, type MockFactory } from '../../src/mock';
import { Request } from '../../src/request';
import { Response } from '../../src/response';
import { Router } from '../../src/router';

// A factory with Jest's semantics: `mockReset()` drops the implementation passed to `fn(impl)`.
const jestLikeFn: MockFactory = (implementation) => {
  const mock = vi.fn(implementation);
  const reset = mock.mockReset.bind(mock);
  mock.mockReset = () => reset().mockImplementation(() => undefined);
  return mock;
};

const importFresh = async () => {
  vi.resetModules();
  return import('../../src/mock');
};

afterEach(() => {
  configure({ fn: vi.fn });
  vi.unstubAllGlobals();
});

describe('configure()', () => {
  beforeEach(() => {
    // A fresh module import still shares the process-wide configuration.
    Reflect.deleteProperty(globalThis, Symbol.for('express-mock-core.mockFactory'));
  });

  test('configure({ fn }) builds every mock with the given factory', () => {
    const fn = vi.fn((implementation?: (...args: never[]) => unknown) => vi.fn(implementation));
    configure({ fn });

    new Response();

    expect(fn).toHaveBeenCalled();
  });

  test('configure() rejects a missing factory', () => {
    expect(() => configure({} as never)).toThrow(
      new TypeError('express-mock-core: configure({ fn }) expects a mock factory such as vi.fn'),
    );
  });

  test('fresh module instances share the configured factory', async () => {
    vi.stubGlobal('vi', undefined);
    vi.stubGlobal('jest', undefined);
    const first = await importFresh();
    const second = await importFresh();
    const fn = vi.fn((implementation?: (...args: never[]) => unknown) => vi.fn(implementation));

    first.configure({ fn });
    const mock = second.createMock(() => 'shared');

    expect(first).not.toBe(second);
    expect(mock()).toBe('shared');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('falls back to globalThis.vi.fn when configure() was never called', async () => {
    const fn = vi.fn(() => vi.fn());
    vi.stubGlobal('vi', { fn });
    vi.stubGlobal('jest', { fn: () => vi.fn() });
    const { createMock } = await importFresh();

    createMock();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('falls back to globalThis.jest.fn when there is no vi global', async () => {
    const fn = vi.fn(() => vi.fn());
    vi.stubGlobal('vi', undefined);
    vi.stubGlobal('jest', { fn });
    const { createMock } = await importFresh();

    createMock();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('throws a setup error when no factory is available', async () => {
    vi.stubGlobal('vi', undefined);
    vi.stubGlobal('jest', undefined);
    const { createMock } = await importFresh();

    expect(() => createMock()).toThrow(
      'express-mock-core: no mock factory configured. Call configure({ fn: vi.fn }) or ' +
        'configure({ fn: jest.fn }) in your test setup file.',
    );
  });

  test('importing the package creates no mocks until they are used', async () => {
    vi.stubGlobal('vi', undefined);
    vi.stubGlobal('jest', undefined);
    vi.resetModules();

    const { default: express } = await import('../../src');

    expect(() => express()).toThrow(/no mock factory configured/);
  });
});

describe('resetMocked() restores default implementations', () => {
  test('res.status() still chains after resetMocked()', () => {
    configure({ fn: jestLikeFn });
    const res = new Response();
    res.status.mockReturnValue(undefined);

    res.resetMocked();

    expect(res.status(404)).toBe(res);
    expect(res.statusCode).toBe(404);
  });

  test('req.get() still reads headers after resetMocked()', () => {
    configure({ fn: jestLikeFn });
    const req = new Request('/', { headers: { 'X-Test': 'yes' } });

    req.resetMocked();

    expect(req.get('x-test')).toBe('yes');
  });

  test('app.get(setting) and app.request.get() work after app.resetMocked()', () => {
    configure({ fn: jestLikeFn });
    const app = new Express();
    app.resetMocked();
    app.request.setHeaders('Accept', 'text/html');

    app.set('title', 'My Site');

    expect(app.get('title')).toBe('My Site');
    expect(app.request.get('accept')).toBe('text/html');
  });

  test('router.get() still calls handlers after router.resetMocked()', () => {
    configure({ fn: jestLikeFn });
    const router = new Router();
    const handler = vi.fn();

    router.resetMocked();
    router.get('/', handler);

    expect(handler).toHaveBeenCalledWith(router.request, router.response, expect.any(Function));
    expect(router.get.getMockName()).toBe('get');
  });

  test('router.resetMocked() clears post, put, patch, delete and next', () => {
    const router = new Router();
    for (const verb of ['post', 'put', 'patch', 'delete'] as const) {
      router[verb]('/', (_req: unknown, _res: unknown, next: () => void) => next());
    }

    router.resetMocked();

    expect(router.post).not.toHaveBeenCalled();
    expect(router.put).not.toHaveBeenCalled();
    expect(router.patch).not.toHaveBeenCalled();
    expect(router.delete).not.toHaveBeenCalled();
    expect(router.next).not.toHaveBeenCalled();
  });
});

describe('per-instance next', () => {
  test('each app and router gets its own next', () => {
    const first = new Express();
    const second = new Express();
    const router = new Router();

    first.next();

    expect(first.next).not.toBe(second.next);
    expect(first.next).not.toBe(router.next);
    expect(second.next).not.toHaveBeenCalled();
    expect(router.next).not.toHaveBeenCalled();
  });

  test('app.resetMocked() clears app.next', () => {
    const app = new Express();
    app.next();

    app.resetMocked();

    expect(app.next).not.toHaveBeenCalled();
  });
});
