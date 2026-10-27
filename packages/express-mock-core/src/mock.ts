// biome-ignore lint/suspicious/noExplicitAny: This upper bound must accept every function signature.
export type Procedure = (...args: any[]) => any;

// Default signature for a mock with no specific type, so bare `MockFn` returns `unknown`, not `any`.
export type UnknownProcedure = (...args: unknown[]) => unknown;

/**
 * The mock API that both `vi.fn()` and `jest.fn()` mocks provide.
 */
export interface MockControls<T extends Procedure = UnknownProcedure> {
  mock: { calls: Parameters<T>[] };
  mockClear(): this;
  mockReset(): this;
  mockImplementation(implementation: T): this;
  mockImplementationOnce(implementation: T): this;
  mockReturnValue(value: ReturnType<T>): this;
  mockReturnValueOnce(value: ReturnType<T>): this;
  mockName(name: string): this;
  getMockName(): string;
}

declare global {
  /**
   * Registers a test runner's own mock type, so every mock is typed as, say, Vitest's `Mock<T>`.
   * It's global so the ESM and CommonJS copies of these types share it. Empty by default;
   * `vitest-express` and `jest-express` fill it in. For another runner, augment it yourself
   * (the constraint must be written exactly like this):
   *
   * ```ts
   * declare global {
   *   interface ExpressMockTypeRegistry<T extends (...args: any[]) => any> {
   *     fn: MyRunnerMock<T>;
   *   }
   * }
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: Augmentations must repeat this exact constraint.
  interface ExpressMockTypeRegistry<T extends (...args: any[]) => any> {}
}

/**
 * A function `T` that is also a mock: the runner's mock type when one is registered in
 * `ExpressMockTypeRegistry`, otherwise `MockControls`. Keeps all of `T`'s overloads, so a
 * mocked Express method is still assignable to the Express type.
 */
export type MockFn<T extends Procedure = UnknownProcedure> =
  ExpressMockTypeRegistry<T> extends { fn: infer M } ? T & M : T & MockControls<T>;

/** A runner's mock factory, e.g. `vi.fn` or `jest.fn`. Typed structurally, so any runner fits. */
export type MockFactory = (implementation?: Procedure) => UnknownProcedure & MockControls;

export interface ConfigureOptions {
  fn: MockFactory;
}

interface MockDefaults {
  implementation?: Procedure;
  name?: string;
}

// Symbol.for keeps setup entries and duplicate ESM/CJS module copies in sync.
const factoryKey = Symbol.for('express-mock-core.mockFactory');
const factoryStore = globalThis as typeof globalThis & { [factoryKey]?: MockFactory };

// Default implementation and name of every mock we create, so `resetMock` can restore them.
const defaults = new WeakMap<MockControls, MockDefaults>();

/**
 * Set the mock factory used for every mock. Call it once in your test runner's setup file:
 * `configure({ fn: vi.fn })` or `configure({ fn: jest.fn })`.
 */
export function configure(options: ConfigureOptions): void {
  if (typeof options?.fn !== 'function') {
    throw new TypeError(
      'express-mock-core: configure({ fn }) expects a mock factory such as vi.fn',
    );
  }
  factoryStore[factoryKey] = options.fn;
}

function getFactory(): MockFactory {
  const configuredFactory = factoryStore[factoryKey];
  if (configuredFactory) {
    return configuredFactory;
  }
  // Fall back to the runner's globals when `configure` was never called.
  const globals = globalThis as { vi?: { fn?: MockFactory }; jest?: { fn?: MockFactory } };
  const fallback = globals.vi?.fn ?? globals.jest?.fn;
  if (typeof fallback === 'function') {
    return fallback;
  }
  throw new Error(
    'express-mock-core: no mock factory configured. Call configure({ fn: vi.fn }) or ' +
      'configure({ fn: jest.fn }) in your test setup file.',
  );
}

/** Create a mock with an optional default implementation and name. */
export function createMock<T extends Procedure = UnknownProcedure>(
  implementation?: T,
  name?: string,
): MockFn<T> {
  // The factory is typed for any procedure; `T` only narrows the signature callers see.
  const mock = getFactory()(implementation) as MockFn<T>;
  if (name) {
    mock.mockName(name);
  }
  defaults.set(mock, { implementation, name });
  return mock;
}

/**
 * Clear a mock's calls and overrides, then restore the default implementation it was
 * created with. Plain `mockReset()` leaves Jest mocks returning `undefined`.
 */
export function resetMock(mock: MockControls): void {
  mock.mockReset();
  const { implementation, name } = defaults.get(mock) ?? {};
  if (implementation) {
    mock.mockImplementation(implementation);
  }
  if (name) {
    mock.mockName(name);
  }
}
