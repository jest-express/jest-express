# Express 5 Example Application with Vitest & vitest-express

This directory contains a small, realistic Express 5 application and its test suite, demonstrating how to use `vitest-express` with Vitest for unit testing alongside a Supertest integration test.

## What the application does

The example application is an Express 5 REST API for user management:

- **App Factory (`src/app.ts`)**: Initializes Express, mounts `express.json()`, routes `/health`, `/users`, a 404 handler, and a centralized error handler.
- **Auth Middleware (`src/middleware/auth.ts`)**: Validates the `Authorization: Bearer <token>` header, calling `next()` on success and `next(err)` on failure.
- **Users Router (`src/routes/users.ts`)**: Handles `GET /users` (list), `GET /users/:id` (fetch user), and `POST /users` (create user with validation).
- **Service Layer (`src/services/user-service.ts`)**: An injectable async data service called by route handlers.
- **Error Handlers (`src/middleware/error-handlers.ts`)**: Handles 404s and formats error responses into consistent JSON.

## Running the tests

From this directory (`examples/express5-app`):

```bash
pnpm install
pnpm test
pnpm typecheck
```

Or from the repository root:

```bash
pnpm test
pnpm turbo run test --filter=example-express5-app
```

## Test techniques shown

| Test file | Technique | What it demonstrates |
|---|---|---|
| `test/route-handler.test.ts` | **Direct Route Handler Unit Testing** | Uses `createRequest()`, `createResponse()`, and `createNext()` to test route handlers in isolation. Inspects status codes (`res.status`, `res.statusCode`), returned JSON (`res.json`, `res.body`), and error forwarding to `next(err)`. |
| `test/auth-middleware.test.ts` | **Middleware Testing** | Tests calling `next()` on valid credentials and `next(HttpError)` with HTTP 401/403 status codes on missing or invalid tokens. |
| `test/async-handler.test.ts` | **Async Rejection Forwarding** | The handlers have no `try/catch`: Express 5 forwards a rejected promise to `next(err)`. Called directly, the handler rejects; registered on a `vitest-express` app, the rejection reaches `app.next`, as it would reach your error handler in Express 5. |
| `test/error-handler.test.ts` | **Error Handler Testing** | Tests 4-argument error middleware (`err, req, res, next`) both by direct invocation and within an Express mock chain (`app.use(failingMw, errorHandler)`). |
| `test/registration.test.ts` | **Middleware Registration** | Uses `vi.mock('express')` to verify that `createApp()` and `createUsersRouter()` mount the expected middleware, routes, and JSON body parser. |
| `test/integration.test.ts` | **Supertest Integration Testing** | Demonstrates when to use Supertest with real Express (end-to-end HTTP pipeline, URL routing, JSON stream parsing) vs `vitest-express` (fast, unit-level isolation). |
