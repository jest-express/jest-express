import './setup';

import express from 'express-mock-core';
import type { Mock } from 'jest-mock';

declare global {
  // Type every mock as Jest's `Mock<T>` (see express-mock-core's `ExpressMockTypeRegistry`).
  // biome-ignore lint/suspicious/noExplicitAny: Must repeat express-mock-core's exact constraint.
  interface ExpressMockTypeRegistry<T extends (...args: any[]) => any> {
    fn: Mock<T>;
  }
}

export * from 'express-mock-core';

export default express;
