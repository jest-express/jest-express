---
"express-mock-core": major
"jest-express": major
"vitest-express": major
---

Split into three packages. `express-mock-core` is the runner-agnostic core. `jest-express` and `vitest-express` configure `jest.fn` or `vi.fn` when imported and re-export the whole core API. The `jest-express/vitest` and `jest-express/jest` setup subpaths are gone: use `setupFiles: ['vitest-express']` or `setupFiles: ['jest-express']`.
