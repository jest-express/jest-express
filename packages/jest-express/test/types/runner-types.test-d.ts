import type * as express from 'express';
import type { Mock } from 'jest-mock';
import { describe, expectTypeOf, test } from 'vitest';

import mockExpress, {
  createNext,
  createRequest,
  createResponse,
  type MockFn,
  type Procedure,
  Router,
} from '../../src';

describe('mocks are typed as the runner Mock', () => {
  test('response methods keep their signature and expose typed calls', () => {
    const res = createResponse();

    expectTypeOf(res.status).toExtend<Mock<(code: number) => express.Response>>();
    expectTypeOf(res.status.mock.calls).toEqualTypeOf<[code: number][]>();
  });

  test('request, app, router and next mocks are runner mocks', () => {
    expectTypeOf(createRequest().get).toExtend<Mock<express.Request['get']>>();
    expectTypeOf(mockExpress().use).toExtend<Mock<Procedure>>();
    expectTypeOf(Router().get).toExtend<Mock<Procedure>>();
    expectTypeOf(createNext()).toExtend<Mock<(err?: unknown) => void>>();
  });

  test('MockFn<T> is the runner Mock plus T', () => {
    expectTypeOf<MockFn<(a: string) => number>>().toEqualTypeOf<
      ((a: string) => number) & Mock<(a: string) => number>
    >();
  });
});

describe('still assignable to Express types', () => {
  test('mocks can be passed to handlers without casts', () => {
    const handler: express.RequestHandler = (_req, res, next) => {
      res.status(200).json({ ok: true });
      next();
    };

    handler(createRequest(), createResponse(), createNext());
    expectTypeOf(mockExpress()).toExtend<express.Express>();
  });
});
