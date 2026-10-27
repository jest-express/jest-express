# vitest-express

## 2.0.0

### Major Changes

- 605eca4: Split into three packages. `express-mock-core` is the runner-agnostic core. `jest-express` and `vitest-express` configure `jest.fn` or `vi.fn` when imported and re-export the whole core API. The `jest-express/vitest` and `jest-express/jest` setup subpaths are gone: use `setupFiles: ['vitest-express']` or `setupFiles: ['jest-express']`.

### Patch Changes

- Updated dependencies [605eca4]
  - express-mock-core@2.0.0
