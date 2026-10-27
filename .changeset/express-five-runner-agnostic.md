---
"jest-express": major
---

Release jest-express 2.0 with test-runner agnostic mocks and per-instance mocks whose defaults are restored by resetMocked(). Jest users load jest-express and Vitest users load vitest-express from their runner's setupFiles; each wrapper configures its runner's mock factory automatically. The express-mock-core core supports other runners through configure({ fn }) and a global fallback.

Target Express 5 behavior, including validated response statuses, case-insensitive headers, request content negotiation, and async errors forwarded to next(err). Add request, response and next factories, Express-assignable types, and runner-typed mocks. jest-express and express-mock-core provide dual ESM/CommonJS builds; vitest-express is ESM-only. Require Node 22 or later and @types/express v5 for TypeScript consumers.

See the [2.0 migration guide](https://github.com/jest-express/jest-express/blob/master/docs/MIGRATING-2.0.md) for setup, removed APIs, behavior changes and migration examples.
