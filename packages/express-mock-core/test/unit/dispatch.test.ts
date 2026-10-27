import assert from 'node:assert';

import { describe, expect, test, vi } from 'vitest';

import { Express } from '../../src/express';
import { Router } from '../../src/router';

// Let promise callbacks (rejected async handlers) run.
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe.each([
  ['app', () => new Express() as unknown as Express & Router],
  ['router', () => new Router() as unknown as Express & Router],
])('%s handlers', (name, create) => {
  test(`${name}.use(path, mw) calls the middleware with req, res and next`, () => {
    const instance = create();
    const mw = vi.fn();

    instance.use('/events', mw);

    expect(mw).toHaveBeenCalledWith(instance.request, instance.response, expect.any(Function));
  });

  test(`${name}.use accepts an array of paths, a RegExp and arrays of middleware`, () => {
    const instance = create();
    const first = vi.fn((_req, _res, next) => next());
    const second = vi.fn((_req, _res, next) => next());
    const third = vi.fn();

    instance.use(['/a', '/b'], first);
    instance.use(/^\/c/, [second, [third]]);

    expect(first).toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
    expect(third).toHaveBeenCalled();
  });

  test(`${name}.use calls (req, res) and rest-parameter middleware`, () => {
    const instance = create();
    const twoArgs = vi.fn((_req: unknown, _res: unknown) => undefined);
    const restArgs = vi.fn((..._args: unknown[]) => undefined);

    instance.use(twoArgs);
    instance.use(restArgs);

    expect(twoArgs).toHaveBeenCalled();
    expect(restArgs).toHaveBeenCalled();
  });

  test(`${name}.get(path, handler) passes next, and next() is recorded on ${name}.next`, () => {
    const instance = create();
    let captured: unknown;

    instance.get('/', (_req: unknown, _res: unknown, next: () => void) => {
      captured = next;
      next();
    });

    expect(captured).toHaveBeenCalledTimes(1);
    expect(instance.next).toHaveBeenCalledTimes(1);
  });

  test(`${name} verb helpers all run their handlers`, () => {
    const instance = create();
    const verbs = ['all', 'get', 'post', 'put', 'patch', 'delete'];
    if (name === 'app') verbs.push('head', 'options', 'connect', 'trace');
    for (const verb of verbs) {
      const handler = vi.fn();
      instance[verb]('/', handler);
      expect(handler, verb).toHaveBeenCalled();
    }
  });

  test(`a second handler runs only after the first calls next()`, () => {
    const instance = create();
    const second = vi.fn();

    instance.get('/', () => undefined, second);
    expect(second).not.toHaveBeenCalled();

    instance.get('/', (_req: unknown, _res: unknown, next: () => void) => next(), second);
    expect(second).toHaveBeenCalledTimes(1);
  });

  test(`next(err) skips regular handlers and reaches the next error handler`, () => {
    const instance = create();
    const error = new Error('boom');
    const skipped = vi.fn();
    const errorHandler = vi.fn((_err, _req, _res, _next) => undefined);

    instance.get(
      '/',
      (_req: unknown, _res: unknown, next: (e: Error) => void) => next(error),
      skipped,
      errorHandler,
    );

    expect(skipped).not.toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledWith(
      error,
      instance.request,
      instance.response,
      expect.any(Function),
    );
    expect(instance.next).toHaveBeenCalledWith(error);
  });

  test(`an error handler that calls next() resumes the regular handlers`, () => {
    const instance = create();
    const after = vi.fn();

    instance.use(
      (_req: unknown, _res: unknown, next: (e: Error) => void) => next(new Error('boom')),
      (_err: unknown, _req: unknown, _res: unknown, next: () => void) => next(),
      after,
    );

    expect(after).toHaveBeenCalled();
  });

  test(`next('route') stops the remaining handlers and is recorded`, () => {
    const instance = create();
    const skipped = vi.fn();

    instance.get(
      '/',
      (_req: unknown, _res: unknown, next: (r: string) => void) => next('route'),
      skipped,
    );

    expect(skipped).not.toHaveBeenCalled();
    expect(instance.next).toHaveBeenCalledWith('route');
  });

  test(`every next() call moves the chain on, like Express`, () => {
    const instance = create();
    const second = vi.fn();
    const third = vi.fn();

    instance.get(
      '/',
      (_req: unknown, _res: unknown, next: () => void) => {
        next();
        next();
      },
      second,
      third,
    );

    expect(second).toHaveBeenCalledTimes(1);
    expect(third).toHaveBeenCalledTimes(1);
    expect(instance.next).toHaveBeenCalledTimes(2);
  });

  test(`all handlers in a registration share the same next`, () => {
    const instance = create();
    const seen: unknown[] = [];

    instance.get(
      '/',
      (_req: unknown, _res: unknown, next: () => void) => {
        seen.push(next);
        next();
      },
      (_req: unknown, _res: unknown, next: () => void) => seen.push(next),
    );

    expect(seen[0]).toBe(seen[1]);
  });

  test(`an error thrown after next() still reaches the error handlers`, async () => {
    const instance = create();
    const order: string[] = [];
    const errorHandler = (err: Error, _req: unknown, _res: unknown, _next: unknown) =>
      order.push(`error ${err.message}`);

    instance.get(
      '/',
      (_req: unknown, _res: unknown, next: () => void) => {
        next();
        throw new Error('sync');
      },
      () => order.push('regular'),
      errorHandler,
    );
    instance.get(
      '/',
      async (_req: unknown, _res: unknown, next: () => void) => {
        next();
        throw new Error('async');
      },
      () => order.push('regular'),
      errorHandler,
    );
    await flush();

    expect(order).toEqual(['regular', 'error sync', 'regular', 'error async']);
  });

  test(`handlers with more than four arguments are skipped`, () => {
    const instance = create();
    const five = vi.fn((_a, _b, _c, _d, _e) => undefined);
    const regular = vi.fn();

    instance.use(five, regular);

    expect(five).not.toHaveBeenCalled();
    expect(regular).toHaveBeenCalled();
  });

  test(`a long synchronous chain continues on setImmediate instead of overflowing`, async () => {
    const instance = create();
    const terminal = vi.fn();
    const passThrough = Array.from(
      { length: 5000 },
      () => (_req: unknown, _res: unknown, next: () => void) => next(),
    );

    instance.use(passThrough, terminal);
    await vi.waitFor(() => expect(terminal).toHaveBeenCalled());
  });

  test(`an error handler is skipped when no error has occurred, as in Express`, () => {
    const instance = create();
    const errorHandler = vi.fn((_err, _req, _res, _next) => undefined);
    const regular = vi.fn();

    instance.use(errorHandler, regular);

    expect(errorHandler).not.toHaveBeenCalled();
    expect(regular).toHaveBeenCalled();
  });

  test(`a thrown error is forwarded to next(err) and the next error handler`, () => {
    const instance = create();
    const error = new Error('sync');
    const errorHandler = vi.fn((_err, _req, _res, _next) => undefined);

    instance.get(
      '/',
      () => {
        throw error;
      },
      errorHandler,
    );

    expect(instance.next).toHaveBeenCalledWith(error);
    expect(errorHandler).toHaveBeenCalledWith(
      error,
      expect.anything(),
      expect.anything(),
      expect.any(Function),
    );
  });

  test(`a rejected async handler is forwarded to next(err)`, async () => {
    const instance = create();
    const error = new Error('async');

    instance.get('/', async () => {
      throw error;
    });
    expect(instance.next).not.toHaveBeenCalled();
    await flush();

    expect(instance.next).toHaveBeenCalledWith(error);
  });

  test(`a promise rejected without a reason becomes Error('Rejected promise')`, async () => {
    const instance = create();

    instance.get('/', () => Promise.reject(undefined));
    await flush();

    expect(instance.next).toHaveBeenCalledWith(new Error('Rejected promise'));
  });

  test(`a failed assertion inside a handler fails the test instead of becoming next(err)`, () => {
    const instance = create();
    const jestStyle = Object.assign(new Error('jest assertion'), { matcherResult: {} });

    expect(() =>
      instance.get('/', () => {
        expect(1).toBe(2);
      }),
    ).toThrow();
    expect(() =>
      instance.use(() => {
        throw jestStyle;
      }),
    ).toThrow(jestStyle);
    expect(instance.next).not.toHaveBeenCalled();
  });

  test(`node:assert errors from app code are forwarded like any other error`, async () => {
    const instance = create();
    const caught: unknown[] = [];
    const errorHandler = (err: unknown, _req: unknown, _res: unknown, _next: unknown) =>
      caught.push(err);

    instance.get('/', () => assert.ok(false, 'sync'), errorHandler);
    instance.get('/', async () => assert.ok(false, 'async'), errorHandler);
    await flush();

    expect(caught).toEqual([
      expect.objectContaining({ code: 'ERR_ASSERTION', message: 'sync' }),
      expect.objectContaining({ code: 'ERR_ASSERTION', message: 'async' }),
    ]);
  });

  test(`${name}.use and ${name}.get return ${name} so calls can be chained`, () => {
    const instance = create();
    const mw = vi.fn((_req, _res, next) => next());

    expect(instance.use(mw).use('/x', mw).get('/', mw)).toBe(instance);
    expect(mw).toHaveBeenCalledTimes(3);
  });

  test(`handlers still run after ${name}.resetMocked()`, () => {
    const instance = create();
    const mw = vi.fn();

    instance.resetMocked();
    instance.use('/x', mw);

    expect(mw).toHaveBeenCalled();
  });
});

describe('app settings', () => {
  test('app.get(name) with one argument still reads a setting', () => {
    const app = new Express() as unknown as Express & Router;
    app.set('title', 'My Site');

    expect(app.get('title')).toBe('My Site');
  });
});
