# Migrating from jest-express 1.x to 2.0

2.0 is a rewrite. The mocks now follow **Express 5** behaviour closely, work with **Vitest or Jest** (or any runner with a `fn()` mock factory), and are typed so they can be passed wherever `@types/express` expects a `Request`, `Response`, `NextFunction`, `Express` app or `Router`.

Most test suites need three changes: a setup file, a new way to assert on `next`, and updated expectations wherever a test relied on a 1.x shortcut that real Express never had. This guide lists every user-visible change, grouped by what you need to do.

## Contents

- [Checklist](#checklist)
- [Requirements](#requirements)
- [1. Install and set up your runner](#1-install-and-set-up-your-runner)
- [2. Imports, factories and types](#2-imports-factories-and-types)
- [3. `next` is no longer shared](#3-next-is-no-longer-shared)
- [4. Handlers run like an Express route](#4-handlers-run-like-an-express-route)
- [5. Error handlers](#5-error-handlers)
- [6. `resetMocked()`](#6-resetmocked)
- [7. Responses](#7-responses)
- [8. Requests](#8-requests)
- [9. The app and router](#9-the-app-and-router)
- [10. Removed APIs](#10-removed-apis)
- [Known limitations](#known-limitations)

## Checklist

- [ ] Node 22 or newer.
- [ ] Jest users: install `jest-express` and add it to `setupFiles`. Vitest users: install `vitest-express` and add it to `test.setupFiles` ([§1](#1-install-and-set-up-your-runner)).
- [ ] Replace deep imports such as `jest-express/lib/request` with imports from your runner's package ([§2](#2-imports-factories-and-types)).
- [ ] Replace `express.Next` with `app.next`, `router.next` or `createNext()` ([§3](#3-next-is-no-longer-shared)).
- [ ] Replace `expect(next).toBe(app.next)` inside handlers with assertions on `app.next` ([§3](#3-next-is-no-longer-shared)).
- [ ] Middleware that doesn't call `next()` now stops the chain. Check tests that register several handlers ([§4](#4-handlers-run-like-an-express-route)).
- [ ] Error handlers only run after an error. Replace `app.setError(...)` + `app.use(errorHandler)` ([§5](#5-error-handlers)).
- [ ] `res.redirect(url)` is now 302, `res.send(404)` no longer sets the status, and `res.status()` validates its argument ([§7](#7-responses)).
- [ ] Response header keys are lower-case: `res.headers['content-type']`, or better, `res.get('Content-Type')` ([§7](#7-responses)).
- [ ] `req.query` and `req.hostname` are getters. Use `setQuery()` / `setHostname()` instead of assigning ([§8](#8-requests)).
- [ ] `req.body` defaults to `undefined` and `req.hostname` to `undefined` (both were `''`) ([§8](#8-requests)).
- [ ] Remove uses of `express.query`, `req.param()` and the other APIs Express 5 dropped ([§10](#10-removed-apis)).

## Requirements

| | 1.x | 2.0 |
|---|---|---|
| Node.js | any | **22+** |
| Express semantics | Express 4, loosely | **Express 5** (5.3) |
| Test runner | Jest only (global `jest`) | **Vitest, Jest**, or any `fn()`-style mock factory |
| Package | `jest-express` | `jest-express` for Jest, `vitest-express` for Vitest, or the `express-mock-core` core |
| Types | `any` everywhere | `@types/express` **v5** (optional peer dependency) |
| Runtime dependencies | `jest-node-http` | **none in the core**; wrappers depend only on the core |

Each wrapper declares its runner as a peer dependency. Install `@types/express` v5 separately
for TypeScript support.

## 1. Install and set up your runner

1.x called the global `jest.fn()` when `jest-express` was imported, so it only worked inside
Jest. In 2.0, the runner-agnostic `express-mock-core` core builds every mock lazily with the
configured factory. The wrappers configure that factory when loaded from your setup files
and re-export the complete core API.

**Jest** keeps the `jest-express` package name:

```sh
pnpm add -D jest-express
```

```js
// jest.config.cjs
module.exports = { setupFiles: ['jest-express'] };
```

**Vitest** uses the new ESM-only `vitest-express` package:

```sh
pnpm add -D vitest-express
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { setupFiles: ['vitest-express'] },
});
```

With another runner, configure the core yourself before creating mocks:

```ts
// test.setup.ts
import { fn } from 'my-test-runner';
import { configure } from 'express-mock-core';

configure({ fn });
```

If `configure()` is never called, the core falls back to a global `vi.fn`, then a global
`jest.fn`, and otherwise throws an error explaining the setup.

Mocking the real module works as before. Vitest needs a module object back from the factory,
and spreading the mock keeps named imports such as `import { Router, json } from 'express'`
working:

```ts
// Vitest: vitest-express must be in test.setupFiles.
vi.mock('express', async () => {
  const { default: express } = await import('vitest-express');
  return { ...express, default: express };
});
```

```js
// Jest
jest.mock('express', () => require('jest-express'));
```

## 2. Imports, factories and types

`require('jest-express')` still returns the callable `express()` mock, with every helper
attached, so 1.x CommonJS code keeps working. Both wrappers provide a default export and
named exports to ES modules; `vitest-express` is ESM-only.

```ts
import express, { createNext, createRequest, createResponse, Router } from 'jest-express';
import type { MockExpress, MockNextFunction, MockRequest, MockResponse, MockRouter } from 'jest-express';
```

Vitest users import the same exports from `vitest-express`.

1.x shipped an empty `index.d.ts`, so TypeScript users got no types (#167). In 2.0, each mock
type is the Express type plus the mock API, so you can pass the mocks straight to your code:

```ts
import type { RequestHandler } from 'express';
import { createNext, createRequest, createResponse } from 'jest-express';

const handler: RequestHandler = (req, res) => {
  res.status(201).json({ ok: true });
};

test('creates the thing', () => {
  const req = createRequest('/things', { method: 'POST' });
  const res = createResponse();

  handler(req, res, createNext());

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.body).toEqual({ ok: true });
});
```

The wrappers also register their runner's mock type: Vitest mocks use Vitest's `Mock<T>`,
and Jest mocks use Jest's `Mock<T>` from `jest-mock`. Other runners can register a type
through the global `ExpressMockTypeRegistry`; without one, mocks use the structural `MockFn<T>`.
Loading both wrappers' types in one TypeScript program is not supported.

**Deep imports are gone.** 1.x documented importing each class from its file, such as
`jest-express/lib/request`. In 2.0, each package exposes only its main entry (and its
`package.json`), so deep paths fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`. Import everything
from your runner's package:

| 1.x | 2.0 |
|---|---|
| `import { Express } from 'jest-express/lib/express'` | `import express from 'jest-express'`, then `express()` (or `import { Express } from 'jest-express'`) |
| `import { Request } from 'jest-express/lib/request'` | `import { createRequest } from 'jest-express'` |
| `import { Response } from 'jest-express/lib/response'` | `import { createResponse } from 'jest-express'` |
| `import { Router } from 'jest-express/lib/router'` | `import { Router } from 'jest-express'`, then `Router()` |

**New factories.** `createRequest(url?, options?)` and `createResponse()` replace the constructors. `new Request()` and `new Response()` still work but are deprecated, and they return the same types.

| 1.x | 2.0 |
|---|---|
| `new Request('/users?id=1', { headers })` | `createRequest('/users?id=1', { headers })` |
| `new Response()` | `createResponse()` |
| `express.Next` | `createNext()` |
| `new Router()` | `Router()` |

`Router` is a function, as in Express: `new Router()` still works at runtime, but TypeScript rejects it (TS7009), just as it rejects `new express.Router()` with `@types/express`.

## 3. `next` is no longer shared

In 1.x, `next` was one mock shared by every app, router and test, so calls leaked between tests. In 2.0:

- every app and router has its own `app.next` / `router.next`;
- `createNext()` returns a fresh `next` for calling a handler directly;
- `express.Next` is gone.

Handlers registered with `app.use` / `app.get` / `router.get` and so on no longer receive `app.next` itself. As in Express, all the handlers in one registration share one `next` function. Every call to it is also recorded on `app.next` (or `router.next`), so assert there:

```ts
// 1.x
app.use((req, res, next) => {
  expect(next).toBe(app.next); // fails in 2.0
});

// 2.0
app.use((req, res, next) => next());
expect(app.next).toHaveBeenCalledTimes(1);
```

## 4. Handlers run like an Express route

1.x called each handler once, in order, whatever it did with `next`. It also skipped some handlers entirely: `app.post`, `app.put`, `app.delete` and the other verbs never ran theirs, `app.use('/path', mw)` never called `mw`, and `(req, res)` middleware was ignored. 2.0 runs every registration the way Express 5 runs a route:

- **All verbs and `use` run their handlers**, on both the app and the router. A leading path, array of paths or RegExp is skipped: the mocks call your handlers, they don't route.
- **A handler runs only after the previous one calls `next()`.** A handler that responds without calling `next()` ends the chain. Each call to `next()` moves on one handler (so calling it twice runs two more).
- **`next('route')` and `next('router')` stop the chain.**
- **Handlers with more than three parameters are skipped** in normal flow, as in Express.
- **The methods return the app or router**, so `app.use(json()).use(router)` works. 1.x returned whatever the handler returned.

```ts
const auth = vi.fn((req, res, next) => next());
const handler = vi.fn((req, res) => res.sendStatus(204));

app.get('/me', auth, handler);

expect(auth).toHaveBeenCalled();
expect(handler).toHaveBeenCalled();
expect(app.response.statusCode).toBe(204);
```

**Thrown errors and rejected promises go to `next(err)`**, as in Express 5. That includes an error thrown after `next()` was called, and a promise rejected with no reason becomes `new Error('Rejected promise')`. The error is recorded on `app.next`.

Because the methods now return the app, you can't `await app.get(...)` to wait for an async handler. Wait for its effect instead:

```ts
app.get('/users/:id', async (req, res, next) => {
  throw new Error('db down');
});

await vi.waitFor(() => expect(app.next).toHaveBeenCalledWith(new Error('db down')));
```

**A failed `expect()` inside a handler still fails your test.** Express would forward it to `next(err)`, which would hide it, so test assertion errors are re-thrown instead: Jest `expect` errors, and Vitest/Chai `AssertionError`s. From a synchronous handler the error comes out of the `app.get(...)` call. From an async handler it surfaces as an unhandled rejection, which fails the test in Jest and fails the run in Vitest. Errors from `node:assert` in your application code are ordinary errors and still go to `next(err)`.

Long chains (more than 100 synchronous `next()` calls) continue on `setImmediate`, as in Express, instead of overflowing the stack.

## 5. Error handlers

An `(err, req, res, next)` handler now runs **only after an error**: `next(err)`, a thrown error, or a rejected promise. This matches Express exactly.

In 1.x, `app.use(errorHandler)` called the handler straight away with `app.error`, which you set with `app.setError()`. That no longer happens. `app.error` and `app.setError()` are deprecated, and they don't reach handlers. To test an error handler, either put a handler that fails in front of it:

```ts
import type { ErrorRequestHandler, RequestHandler } from 'express';

const errorHandler = vi.fn<ErrorRequestHandler>((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
const fail: RequestHandler = (req, res, next) => next(new Error('boom'));

app.use(fail, errorHandler);

expect(errorHandler).toHaveBeenCalled();
expect(app.response.statusCode).toBe(500);
```

or call it directly:

```ts
const req = createRequest();
const res = createResponse();

errorHandler(new Error('boom'), req, res, createNext());
```

Type the handlers (`RequestHandler`, `ErrorRequestHandler`) when you pass a regular handler and an error handler in one `app.use()` call. With inline untyped functions, TypeScript can't pick an overload and reports implicit `any` in `strict` mode, against real Express types as well as the mocks.

When an error handler calls `next()` with no argument, the chain continues with the regular handlers after it, as in Express.

## 6. `resetMocked()`

In 1.x, `resetMocked()` called `mockReset()`, which removed the mocks' implementations, so afterwards `res.status(404)` returned `undefined` and chaining broke. In 2.0, `resetMocked()`:

- clears call history **and restores the default implementations**, so `res.status(404).json(...)` keeps chaining;
- resets `res.statusCode` to 200 (1.x kept the old status);
- on a router, also resets `post`, `put`, `patch`, `delete`, `next`, `router.request` and `router.response` (1.x missed these);
- on an app, also resets `app.router` (without replacing it);
- restores a request created from a URL to that URL, including its query and Host header.

The module-level `express.resetMocked()` resets `express.json`, `express.urlencoded`, `express.static`, `express.text` and `express.raw`.

## 7. Responses

**Status codes**

| Call | 1.x | 2.0 (Express 5) |
|---|---|---|
| `res.redirect('/x')` | status 307 | status **302** |
| `res.redirect('/x', 301)` | `statusCode = '/x'` | treats `301` as the URL: sets Location to `'301'` (plus Vary and Content-Type), then throws `TypeError` because `'/x'` isn't a status. Use `res.redirect(301, '/x')` |
| `res.send(404)` | body 404 | sends the JSON number `404` with status **200** (use `res.sendStatus(404)`) |
| `res.send(body, 201)`, `res.json(obj, 201)`, `res.jsonp(obj, 201)` | status argument used | status argument **ignored** |
| `res.sendStatus(404)` | did nothing | sets `statusCode` 404, body `'Not Found'`, Content-Type `text/plain; charset=utf-8` |
| `res.status(1000)`, `res.status(200.5)`, `res.status('200')` | accepted | throws `RangeError` / `TypeError` with Express's messages |

`res.sendStatus()` and `res.redirect(status, url)` validate the status the same way. An invalid status leaves `statusCode` unchanged.

**Headers**

- Header names are case-insensitive. `res.headers` keys are stored **lower-case**, like Node's `getHeaders()`. Prefer `res.get('Content-Type')`, which now reads stored headers (1.x always returned `undefined`).
- `res.removeHeader(name)` removes the header.
- `res.json()`, `res.jsonp()`, `res.send()` and `res.sendStatus()` set a default Content-Type when none is set, as Express does: JSON for objects, arrays, numbers and booleans, `text/html` for strings, `application/octet-stream` for Buffers.
- `res.type()` sets Content-Type. `res.type()` and `res.set('Content-Type', …)` add `; charset=utf-8` to `text/*` types and `application/json`, as Express does (`res.type('json')` gives `application/json; charset=utf-8`; `application/vnd.api+json` gets no charset). `res.type()` goes through `res.set()`, so it records a call on `res.set`.
- `res.location(url)` sets Location. `'back'` is a literal path in Express 5, so there is no Referer lookup.
- `res.vary(field)` builds the Vary header (it was a no-op): it appends fields, de-duplicates them case-insensitively, accepts arrays, and collapses to `*`. It throws `TypeError` when the field is missing or invalid.
- `res.links({ next, last })` sets the Link header, including a repeated `rel` given as an array, appends to an existing Link header, and returns `res` (it was a no-op).

**Redirects** set Location, Vary, Content-Type, Content-Length and the plain-text body (`Found. Redirecting to /x`), and they go through `res.location`, `res.vary`, `res.type` and `res.status` like Express. Expect those mocks to record calls after a redirect.

**Other changes**: `res.end()` returns `res` and keeps the existing body when called with no data. `res.jsonp()` also sets `X-Content-Type-Options: nosniff`.

## 8. Requests

**`req.query` is a getter**, as in Express 5. Assigning to it throws in strict mode (all ES modules and TypeScript output), and changes to the returned object don't stick. Use the helpers, or override the getter the way you would with real Express:

```ts
// 1.x
req.query = { page: '2' }; // TypeError in 2.0

// 2.0
req.setQuery('page', '2');
// or
req.setUrl('/items?page=2');
// or
vi.spyOn(req, 'query', 'get').mockReturnValue({ page: '2' });
```

The query is parsed like Express 5's default "simple" parser, so repeated keys become arrays (`?a=1&a=2` gives `{ a: ['1', '2'] }`).

**Host and hostname**

- `req.host` is new: the Host header including the port, or the first X-Forwarded-Host value when the app trusts the proxy (`app.enable('trust proxy')`).
- `req.hostname` is now derived from `req.host`, as in Express 5: it drops the port, honours `trust proxy`, and keeps IPv6 brackets (`[::1]`, where 1.x gave `::1`). It is `undefined` without a Host header (1.x defaulted to `''`). It is a getter, so use `setHostname()` to override it until `resetMocked()`.
- `createRequest('http://example.com:3000/x')` and `setUrl()` with an absolute URL set the Host header, as a real client would, unless you pass one in `options.headers`.

**Content negotiation**: `req.accepts()`, `req.acceptsCharsets()`, `req.acceptsEncodings()` and `req.acceptsLanguages()` now match against the `Accept*` headers like Express (q-values, wildcards, language prefixes, `identity` for encodings) and return the best match or `false` (#285). 1.x always returned `undefined`.

**Paths**: `req.path` and `req.originalUrl` keep the raw path, as Express does. `/a/../b` stays `/a/../b`, and non-ASCII characters are not percent-encoded. The deprecated `url.parse` (DEP0169 warning) is no longer used.

**Defaults**

| Property | 1.x | 2.0 |
|---|---|---|
| `req.body` | `''` | `undefined` (set one with `setBody()`) |
| `req.hostname` | `''` | `undefined` (derived from the Host header) |
| `req.params` | `{}` | object with a null prototype |
| `req.query` | `{}` | getter returning an object with a null prototype |

## 9. The app and router

- `app.set(name)` with one argument returns the setting (1.x stored `undefined`). `app.set`, `app.enable` and `app.disable` return the app, so they chain. `app.enable` and `app.disable` go through `app.set`, so they record calls on the `app.set` mock.
- `app.router` is new: a per-app `MockRouter`, created on first use and the same object on every read.
- `express.text()` and `express.raw()` are new module-level middleware mocks, alongside `express.json()`, `express.urlencoded()` and `express.static()`.
- These factories now return a pass-through middleware that calls `next()` (1.x returned `undefined`). Each returns the same middleware every time, so `expect(app.use).toHaveBeenCalledWith(express.json())` checks what was registered. They don't parse bodies or serve files: set `req.body` with `setBody()`.

## 10. Removed APIs

| Removed | Use instead |
|---|---|
| `express.Next` | `app.next`, `router.next`, `createNext()` |
| `express.query()` | nothing (removed from Express 5) |
| `app.error`, `app.setError()` (deprecated, no effect on handlers) | a handler that calls `next(err)`, or call the error handler directly |
| `req.param(name)` | `req.params[name]`, `req.body[name]` or `req.query[name]` |
| `req.acceptsCharset`, `req.acceptsEncoding`, `req.acceptsLanguage` | the plural forms |
| `res.sendfile` | `res.sendFile` |
| `app.del` | `app.delete` |
| `new Request()`, `new Response()` (deprecated) | `createRequest()`, `createResponse()` |

`req.is()` now checks Content-Type using Express 5 matching and also treats a body set with `setBody()` or assigned to `req.body` (anything other than `undefined`) as present without framing headers.

## Known limitations

These are deliberate, to keep the package small and free of runtime dependencies:

- **No routing.** Paths passed to `app.use` and `app.METHOD` are ignored. The registered handlers always run, with the app's single `request` and `response`. Use [supertest](https://github.com/ladjs/supertest) for integration tests that exercise routing.
- **Each registration runs on its own.** Handlers run as soon as they're registered, one `app.use()` / `app.METHOD()` call at a time. A later `app.use(errorHandler)` doesn't receive errors from earlier registrations, as it would for a real request flowing through the app. Put the error handler in the same call (`app.use(fail, errorHandler)`), or call it directly.
- **Sub-apps and routers passed to `app.use` are not run.** Express's `app.router` is itself middleware; the mock's is a router object.
- **Redirect bodies are always plain text.** Express chooses an HTML body from the request's `Accept` header, but a mock response isn't linked to a request.
- **`trust proxy` with an address string** (`'loopback'`, `'10.0.0.0/8'`) trusts every proxy, because Express's `proxy-addr` matching isn't reproduced. `true`/`false`, hop counts and functions behave like Express.
- **`req.range()` is a stub.** It records calls and returns `undefined` rather than checking `Range`. Set a return value with `mockReturnValue()` when the code under test depends on it.
- **Cookies aren't stored.** `res.cookie()` and `res.clearCookie()` record calls only.
- **Assertion detection is by name.** App code that throws its own error named `AssertionError` (other than from `node:assert`) is re-thrown from the handler instead of reaching `next(err)`.
