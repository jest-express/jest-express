# express-mock-core

Mock Express 5 apps, routers, requests, responses and `next` functions with any test runner
that provides a compatible `fn()` mock factory. The mocks are typed against
`@types/express` v5 and can be passed directly to Express handlers.

Most Vitest users should install [`vitest-express`](../vitest-express/README.md), and most
Jest users should install [`jest-express`](../jest-express/README.md). Those wrappers configure
the correct factory automatically. Use this core package directly with another runner or a
custom mock factory.

Requires Node 22 or newer. Install `@types/express` v5 for TypeScript support. The core has
no runtime dependencies.

## Configure the mock factory

Call `configure({ fn })` once in your test setup, before creating any mocks. Every app,
request, response and `next` function is then created lazily with that factory:

```ts
// test.setup.ts
import { fn } from 'my-test-runner';
import { configure } from 'express-mock-core';

configure({ fn });
```

The factory must provide the common mock controls used by Jest and Vitest, including
`mock.calls`, `mockClear()`, `mockReset()`, `mockImplementation()` and `mockReturnValue()`.
Create fresh mocks after configuration:

```ts
import { createNext, createRequest, createResponse } from 'express-mock-core';

const req = createRequest('/users/42');
const res = createResponse();
const next = createNext();
```

### Global fallback

If `configure()` was never called, the core tries `globalThis.vi?.fn` and then
`globalThis.jest?.fn`. If neither global exists, creating a mock throws an error explaining
how to configure the factory. Explicit setup is recommended; the wrappers are the simplest
option for Vitest and Jest.

## Runner-typed mocks

Without a type registration, mocked methods use the structural `MockFn<T>` type. A runner
integration can replace that fallback with its own mock type through the global
`ExpressMockTypeRegistry` interface. The interface is global, rather than exported from the
package, so the ESM and CommonJS copies of the types share the same registration. For
example, if your runner exports a `Mock<T>` type:

```ts
// test/express-mock-core.d.ts (any file included in the test TypeScript program)
import type { Mock } from 'my-test-runner';

declare global {
  // The constraint must be written exactly like this.
  interface ExpressMockTypeRegistry<T extends (...args: any[]) => any> {
    fn: Mock<T>;
  }
}
```

A `.d.ts` file with a top-level import is a module, so `declare global` is valid there.
Include that declaration in the TypeScript program for your tests. `vitest-express` registers
Vitest's `Mock<T>` automatically, while `jest-express` registers Jest's `Mock<T>` from
`jest-mock`. Loading both wrappers' types in one program is not supported.

## API reference

### Exports

| Export | Purpose |
| --- | --- |
| Default `express()` | Fresh mock app with `request`, `response`, `next` and lazy `router` |
| `Router()` / `express.Router()` | Fresh mock router with `request`, `response` and `next` |
| `createRequest(url?, options?)` | Request; options accept `method`, `headers` and `app` |
| `createResponse()` | Response with chainable methods, `statusCode`, `body` and `headers` |
| `createNext()` | Fresh mock compatible with Express `NextFunction` |
| `configure({ fn })` | Set the mock factory used by every mock |
| `resetMocked()` / `express.resetMocked()` | Reset module-level `json`, `urlencoded`, `static`, `text` and `raw` mocks |
| `MockExpress`, `MockRouter`, `MockRequest`, `MockResponse`, `MockNextFunction` | Express-assignable types with mock controls and helpers |
| `RequestOptions`, `ConfigureOptions`, `MockFactory`, `MockFn`, `MockControls`, `Procedure`, `JestExpress` | Types for configuration, factories and mocks |

The default export also exposes the factories, constructors, middleware and
`express.resetMocked()` as properties. `require('express-mock-core')` returns the same callable
Express mock. ES modules can use the default export or named exports.

Use the factories for new code. `new Express()`, `new Request()` and `new Response()` remain
available as legacy constructors; the request and response constructors are deprecated in
favor of `createRequest()` and `createResponse()`. `Router` is a function, as in Express.

### Request helpers

| Helper | Purpose |
| --- | --- |
| `req.setHeaders(key, value)` | Set request headers; also accepts a record |
| `req.setBody(value)` | Set parsed body data |
| `req.setParams(key, value)`, `setQuery(key, value)` | Set path params or query values; also accept records |
| `req.setUrl(url, options?)` | Parse URL, query and, for absolute URLs, the Host header |
| `req.setHostname(value)` | Override the hostname getter until reset |
| `req.setMethod`, `setPath`, `setOriginalUrl`, `setBaseUrl`, `setProtocol` | Set request metadata |
| `req.setCookies`, `setSignedCookies`, `setRoute` | Set keyed values; also accept records |
| `req.setIp`, `setIps`, `setSubdomains`, `setSecure`, `setXhr`, `setFresh`, `setStale` | Set request properties |
| `req.resetMocked()` | Reset the request, including its constructor URL and options |

`req.body` starts as `undefined`. `req.query` is a getter returning a fresh null-prototype
object; use `setQuery()` or `setUrl()` rather than assigning or mutating it. `req.params`
also has a null prototype.

Request methods such as `get` and `accepts*` record calls and answer from the request
headers. `req.is()` checks Content-Type using Express 5 matching. A body set with
`setBody()` or assigned directly to `req.body` counts as present even without framing
headers. `req.range()` only records calls and returns `undefined`; set a return value with
`mockReturnValue()` when your code depends on it.

### Response helpers and state

| Helper or property | Purpose |
| --- | --- |
| `res.body` | Last value passed to `send`, `json`, `jsonp`, `text` or `end` |
| `res.headers` | Stored headers, keyed by lower-case names |
| `res.statusCode` | Current status, initially 200 |
| `res.setLocals(key, value)` | Set response locals |
| `res.setHeadersSent(boolean)` | Set whether headers have been sent |
| `res.resetMocked()` | Restore default methods and response state |

Response methods record writes and support Express-style chaining. Header names are
case-insensitive; read them with `res.get(name)` or lower-case keys in `res.headers`.
`json`, `send`, `sendStatus` and redirects set their Express 5 default headers and bodies.
Cookies record calls only.

### App and router helpers

| Helper or property | Purpose |
| --- | --- |
| `app.request`, `app.response`, `app.next` | The app's request, response and recorded `next` calls |
| `app.router` | The app's lazily created base router |
| `app.setLocals(key, value)` | Set app locals |
| `app.setMountPath(value)` | Set the mount path |
| `router.request`, `router.response`, `router.next` | The router's request, response and recorded `next` calls |
| `app.resetMocked()`, `router.resetMocked()` | Reset the instance and its request, response and `next`; an app also resets its router |

App and router `use` and HTTP methods record registrations and immediately execute their
handlers. Within one registration, a handler must call `next()` to reach the next handler.
`next('route')` and `next('router')` stop the chain. Calls to the supplied `next`, including
forwarded errors, are also recorded on `app.next` or `router.next`; the handler's `next`
argument is a separate function.

Thrown errors and rejected promises skip to an `(err, req, res, next)` handler in the same
registration. An error handler registered separately does not catch errors from earlier
registrations. Registration methods return the app or router, not the handler's return value.

The module-level middleware factories `express.json()`, `express.urlencoded()`,
`express.static()`, `express.text()` and `express.raw()` record their options and return a
pass-through middleware that calls `next()`. Each factory returns the same middleware every
time, so `expect(app.use).toHaveBeenCalledWith(express.json())` checks what was registered.
They do not parse bodies or serve files.

### Resetting between tests

`resetMocked()` clears call history, restores default implementations and resets instance
state. Response chaining still works afterwards. For a standalone `createNext()` mock, use
your runner's `mockClear()` between tests. Restore runner-created spies separately.

## Known limitations

These are deliberate, to keep the core small and free of runtime dependencies:

- **No routing.** Paths passed to `app.use` and `app.METHOD` are ignored. The registered handlers always run, with the app's single `request` and `response`. Use [supertest](https://github.com/ladjs/supertest) for integration tests that exercise routing.
- **Each registration runs on its own.** Handlers run as soon as they're registered, one `app.use()` or `app.METHOD()` call at a time. Put an error handler in the same call as the failing handler, or call it directly.
- **Sub-apps and routers passed to `app.use` are not run.** Express's `app.router` is itself middleware; the mock's is a router object.
- **Redirect bodies are always plain text.** Express chooses an HTML body from the request's `Accept` header, but a mock response isn't linked to a request.
- **`trust proxy` with an address string** (`'loopback'`, `'10.0.0.0/8'`) trusts every proxy, because Express's `proxy-addr` matching isn't reproduced. `true`/`false`, hop counts and functions behave like Express.
- **`req.range()` is a stub.** It records calls and returns `undefined` rather than checking `Range`.
- **Cookies aren't stored.** `res.cookie()` and `res.clearCookie()` record calls only.
- **Assertion detection is by name.** App code that throws its own error named `AssertionError` (other than from `node:assert`) is re-thrown from the handler instead of reaching `next(err)`.

See the [Vitest recipes](../vitest-express/README.md#recipes) or [Jest recipes](../jest-express/README.md#recipes) for complete examples.
