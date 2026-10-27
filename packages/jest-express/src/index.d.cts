// Hand-written: the d.ts bundler rewrites `import x = require()` to `import * as x`, which is
// not callable under `esModuleInterop`. This keeps `express()` callable and its type namespace.
import type { Mock } from 'jest-mock';

import express = require('express-mock-core');

declare global {
  // Type every mock as Jest's `Mock<T>`, as in index.ts.
  // biome-ignore lint/suspicious/noExplicitAny: Must repeat express-mock-core's exact constraint.
  interface ExpressMockTypeRegistry<T extends (...args: any[]) => any> {
    fn: Mock<T>;
  }
}

export = express;
