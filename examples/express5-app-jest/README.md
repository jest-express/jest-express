# Express 5 Example Application with Jest & jest-express

This directory contains a small, realistic Express 5 application and its test suite written in plain CommonJS JavaScript, demonstrating how to use `jest-express` with Jest 30 for unit testing.

## What the application does

The example application is an Express 5 REST API:

- **App Factory (`src/app.js`)**: Initializes Express, mounts `express.json()`, `/health` route, and authenticated `/users` routes.
- **Auth Middleware (`src/middleware/auth.js`)**: Validates `Authorization: Bearer <token>`, calling `next()` on success or `next(err)` with HTTP 401 on failure.
- **Users Router (`src/routes/users.js`)**: Handles `GET /users` (list), `GET /users/:id` (fetch user), and `POST /users` (create user).

## Running the tests

From this directory (`examples/express5-app-jest`):

```bash
pnpm test
```

Or from the repository root:

```bash
pnpm test
pnpm turbo run test --filter=example-express5-app-jest
```

## Test techniques shown

| Test file | Technique | What it demonstrates |
|---|---|---|
| `test/route-handler.test.js` | **Route Handler Unit Testing** | Uses `createRequest()` and `createResponse()` to test route handlers in isolation. Inspects status codes (`res.status`, `res.statusCode`), returned JSON (`res.json`), and error forwarding to `next(err)`. |
| `test/middleware.test.js` | **Middleware Testing** | Uses `createNext()` to verify calling `next()` on valid credentials and `next(err)` with HTTP 401 on missing or malformed tokens. |
| `test/async-handler.test.js` | **Async Rejection Forwarding** | Demonstrates Express 5 promise rejection forwarding: unhandled errors in async handlers registered on an app reach `app.next`. |
| `test/reset-mocked.test.js` | **Mock State Restoration** | Demonstrates `res.resetMocked()` and `resetMocked()` to clear call history and restore default mock implementations and chaining behavior. |
