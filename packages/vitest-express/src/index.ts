import './setup';

import express from 'express-mock-core';
import type { Mock } from 'vitest';

declare global {
  // Type every mock as Vitest's `Mock<T>` (see express-mock-core's `ExpressMockTypeRegistry`).
  // biome-ignore lint/suspicious/noExplicitAny: Must repeat express-mock-core's exact constraint.
  interface ExpressMockTypeRegistry<T extends (...args: any[]) => any> {
    fn: Mock<T>;
  }
}

export * from 'express-mock-core';

export default express;
