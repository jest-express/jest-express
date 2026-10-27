import { createMock } from './mock';
import type { MockNextFunction } from './types';

export type NextFunction = MockNextFunction;

/** Create a fresh `next` mock. Every app and router gets its own. */
export function createNext(): MockNextFunction {
  // `(err?: unknown) => void` satisfies every NextFunction overload.
  return createMock<(err?: unknown) => void>() as MockNextFunction;
}
