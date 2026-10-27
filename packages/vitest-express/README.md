# vitest-express

Mock Express 5 apps, routers, requests, responses and `next` functions in Vitest. Importing
this package configures `vi.fn` automatically and re-exports the complete runner-agnostic
core API. Mocks are typed against `@types/express` v5 and use Vitest's own `Mock<T>` type.

Requires Node 22 or newer and Vitest 3 or newer. Install `@types/express` v5 for TypeScript
support. **This package is ESM-only:** Vitest cannot be loaded with `require()`, so there is
no CommonJS build.

## Install

```sh
pnpm add -D vitest-express
```

Install Vitest separately if it is not already in your project.

## Setup

Add `vitest-express` to `test.setupFiles`. This configures the factory before your tests
create mocks:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { setupFiles: ['vitest-express'] },
});
```

Import the default Express mock or any named core export directly from `vitest-express`:

```ts
import express, { createNext, createRequest, createResponse } from 'vitest-express';
```

### Runner-typed mocks

The wrapper registers Vitest's `Mock<T>` with the global `ExpressMockTypeRegistry`. Methods
such as `res.status` therefore have Vitest's mock methods and call types without a
`vi.mocked()` cast. Mock return types follow the Express signature, so
`app.get.mockReturnValueOnce(undefined)` no longer type-checks because `app.get` returns the
app. Use one wrapper per TypeScript program: loading both `vitest-express` and
`jest-express` types at once is not supported.

See the [core README](../express-mock-core/README.md#api-reference) for the full API, instance
helpers and known limitations.

## Recipes

Each test creates its own mocks unless it demonstrates resetting a shared instance.

### Test a route handler

Call a handler directly with `createRequest()`, `createResponse()` and `createNext()`.
Response methods record calls and update readable state; header names are case-insensitive.

```ts
// handler.test.ts
import { expect, test } from 'vitest';
import type { RequestHandler } from 'express';
import { createNext, createRequest, createResponse } from 'vitest-express';

const createThing: RequestHandler = (req, res) => {
  res.set('X-Thing-Id', '42').status(201).json({ name: req.body.name });
};

test('creates a thing with a JSON response and header', () => {
  const req = createRequest('/things', { method: 'POST' });
  req.setBody({ name: 'Ada' });
  const res = createResponse();
  const next = createNext();

  createThing(req, res, next);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({ name: 'Ada' });
  expect(res.statusCode).toBe(201);
  expect(res.body).toEqual({ name: 'Ada' });
  expect(res.get('x-thing-id')).toBe('42');
  expect(res.get('Content-Type')).toBe('application/json; charset=utf-8');
  expect(next).not.toHaveBeenCalled();
});
```

### Test middleware calling next()

Use a fresh `next` mock for each invocation, including error cases.

```ts
// middleware.test.ts
import { expect, test } from 'vitest';
import type { RequestHandler } from 'express';
import { createNext, createRequest, createResponse } from 'vitest-express';

const authorize: RequestHandler = (req, res, next) => {
  if (req.get('Authorization') === 'Bearer valid') next();
  else next(new Error('Unauthorized'));
};

test('continues with valid credentials', () => {
  const req = createRequest();
  req.setHeaders('Authorization', 'Bearer valid');
  const next = createNext();

  authorize(req, createResponse(), next);

  expect(next).toHaveBeenCalledExactlyOnceWith();
});

test('forwards an authorization error', () => {
  const next = createNext();

  authorize(createRequest(), createResponse(), next);

  expect(next).toHaveBeenCalledExactlyOnceWith(new Error('Unauthorized'));
});
```

### Mock Express and check router registration

Mock `express` so the module under test receives the mock. Vitest requires the factory to
return a module object. Spreading the mock gives it a `default` export plus named exports,
so both default and named imports from `express` work. The setup file must run first.

```ts
// routes.ts
import express from 'express';
import type { RequestHandler } from 'express';

export const authorize: RequestHandler = (req, res, next) => next();
export const router = express.Router();
router.use('/private', authorize);
```

```ts
// routes.test.ts
import { expect, test, vi } from 'vitest';

vi.mock('express', async () => {
  const { default: express } = await import('vitest-express');
  return { ...express, default: express };
});

test('registers authorization for /private', async () => {
  const { authorize, router } = await import('./routes');

  expect(router.use).toHaveBeenCalledWith('/private', authorize);
});
```

Import the module inside the test so automatic mock clearing does not erase its registration
calls before the assertion. The mock runs handlers immediately when registered, ignoring
the path. This checks registration; use supertest to test routing through nested routers.

### Test an error handler, two ways

An error handler must declare all four parameters. Call it directly, or place a failing
middleware before it in the same registration. A separate later `app.use(errorHandler)` does
not catch errors from earlier registrations.

```ts
// errors.test.ts
import { expect, test } from 'vitest';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import express, { createNext, createRequest, createResponse } from 'vitest-express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ error: err.message });
};

test('handles an error forwarded by middleware', () => {
  const app = express();
  const error = new Error('boom');

  const fail: RequestHandler = (req, res, next) => next(error);
  app.use(fail, errorHandler);

  expect(app.next).toHaveBeenCalledWith(error);
  expect(app.response.statusCode).toBe(500);
  expect(app.response.body).toEqual({ error: 'boom' });
});

test('handles an error when called directly', () => {
  const res = createResponse();
  const next = createNext();

  errorHandler(new Error('boom'), createRequest(), res, next);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'boom' });
  expect(next).not.toHaveBeenCalled();
});
```

### Test an async handler

Thrown errors and rejected promises are forwarded to `app.next` or `router.next`.
Registration returns the app or router, so wait for the effect instead of awaiting
`app.get()`:

```ts
// async.test.ts
import { expect, test, vi } from 'vitest';
import express from 'vitest-express';

test('forwards a rejected async handler to next', async () => {
  const app = express();
  const error = new Error('db down');

  app.get('/users/:id', async () => {
    throw error;
  });

  await vi.waitFor(() => expect(app.next).toHaveBeenCalledWith(error));
});
```

### Set request data and override query

`req.query` is a getter returning a fresh object. Use `setQuery()` or spy on the getter;
assigning to `req.query` or mutating its returned object is unsupported. Body starts as
`undefined`. Helpers accepting a key/value also accept a record of string values.

```ts
// request-data.test.ts
import { expect, test, vi } from 'vitest';
import { createRequest } from 'vitest-express';

test('sets headers, body, params and query', () => {
  const req = createRequest('/users/42?page=1', { method: 'POST' });
  req.setHeaders({ Authorization: 'Bearer valid' });
  req.setBody({ name: 'Ada' });
  req.setParams('id', '42');
  req.setQuery('page', '2');

  expect(req.get('Authorization')).toBe('Bearer valid');
  expect(req.body).toEqual({ name: 'Ada' });
  expect(req.params.id).toBe('42');
  expect(req.query.page).toBe('2');
});

test('overrides the query getter', () => {
  const req = createRequest('/items?page=1');
  const getter = vi.spyOn(req, 'query', 'get').mockReturnValue({ page: '3' });
  try {
    expect(req.query).toEqual({ page: '3' });
  } finally {
    getter.mockRestore();
  }
  expect(req.query.page).toBe('1');
});
```

### Reset between tests

`resetMocked()` clears call history, restores default implementations and resets instance
state. Response chaining still works afterwards. An app or router reset also resets its
request, response and `next`; an app also resets its lazily created router.

```ts
// reset.test.ts
import { beforeEach, expect, test } from 'vitest';
import { createResponse } from 'vitest-express';

const res = createResponse();
beforeEach(() => res.resetMocked());

test('allows a temporary implementation', () => {
  res.status.mockImplementation(() => res);
  res.status(503);
  expect(res.status).toHaveBeenCalledWith(503);
});

test('restores default status behavior and chaining', () => {
  expect(res.status).not.toHaveBeenCalled();
  expect(res.statusCode).toBe(200);
  res.status(201).json({ ok: true });
  expect(res.statusCode).toBe(201);
  expect(res.body).toEqual({ ok: true });
});
```

For a standalone `createNext()` mock, use `mockClear()` between tests. Restore Vitest spies
separately, as in the query example.

## Integration tests

These mocks do not perform URL matching or emulate the HTTP stack. Use
[supertest](https://github.com/ladjs/supertest) with real Express for integration tests.
