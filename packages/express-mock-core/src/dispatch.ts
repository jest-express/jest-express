import { createMock, type Procedure } from './mock';

export interface DispatchContext {
  request: unknown;
  response: unknown;
  /** The instance's `next` mock. Every `next()` call from a handler is recorded on it. */
  next: (...args: unknown[]) => unknown;
}

const isPath = (value: unknown): boolean =>
  typeof value === 'string' ||
  value instanceof RegExp ||
  (Array.isArray(value) &&
    value.length > 0 &&
    value.every((path) => typeof path === 'string' || path instanceof RegExp));

const isPromise = (value: unknown): value is PromiseLike<unknown> =>
  !!value &&
  (typeof value === 'object' || typeof value === 'function') &&
  typeof (value as { then?: unknown }).then === 'function';

// A failed `expect()` inside a handler must fail the test instead of turning into `next(err)`.
// Jest's expect() errors carry `matcherResult`; Vitest's are Chai `AssertionError`s. node:assert
// also throws `AssertionError`, but with `code: 'ERR_ASSERTION'`, and is treated as an ordinary
// app error. Duck-typed, so errors from other realms are recognised too.
const isTestAssertion = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const error = value as { name?: unknown; code?: unknown };
  return (
    'matcherResult' in error || (error.name === 'AssertionError' && error.code !== 'ERR_ASSERTION')
  );
};

/**
 * Run the handlers passed to `app.use`, `app.METHOD` or `router.METHOD` like Express 5's
 * `Route#dispatch`: all handlers share one `next`, and each call moves on to the next handler.
 * With an error (from `next(err)`, a throw, or a rejected promise), only 4-argument handlers
 * run; without one, handlers with more than 3 arguments are skipped. `next('route')` and
 * `next('router')` stop. After 100 synchronous steps the chain continues on `setImmediate`,
 * as in Express. A leading path is skipped because the mocks don't route.
 *
 * Every `next()` call made by a handler, including the forwarded errors, is recorded on the
 * instance's `next` mock. Test assertion errors are re-thrown instead, so they fail the test:
 * synchronously from the registration call, or as an unhandled rejection from async handlers.
 */
export function dispatch(args: unknown[], context: DispatchContext): void {
  const handlers = (isPath(args[0]) ? args.slice(1) : args)
    .flat(Number.POSITIVE_INFINITY)
    .filter((handler): handler is Procedure => typeof handler === 'function');
  const { request, response } = context;
  let index = 0;
  let sync = 0;

  // Express's internal `next`. Skipped handlers call it directly, so skips aren't recorded.
  const step = (error?: unknown): void => {
    if (error === 'route' || error === 'router' || index >= handlers.length) {
      return;
    }
    if (++sync > 100) {
      setImmediate(step, error);
      return;
    }
    const handler = handlers[index++];
    if (error) {
      if (handler.length !== 4) {
        step(error);
      } else {
        invoke(() => handler(error, request, response, next));
      }
    } else if (handler.length > 3) {
      step();
    } else {
      invoke(() => handler(request, response, next));
    }
    sync = 0;
  };

  // The `next` every handler receives.
  const next = createMock((...nextArgs: unknown[]) => {
    context.next(...nextArgs);
    step(nextArgs[0]);
  });

  const invoke = (call: () => unknown): void => {
    try {
      const result = call();
      if (isPromise(result)) {
        result.then(undefined, (reason) => {
          if (isTestAssertion(reason)) {
            throw reason;
          }
          next(reason || new Error('Rejected promise'));
        });
      }
    } catch (thrown) {
      if (isTestAssertion(thrown)) {
        throw thrown;
      }
      next(thrown);
    }
  };

  step();
}
