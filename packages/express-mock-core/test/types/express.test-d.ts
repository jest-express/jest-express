import type * as express from 'express';
import { describe, expectTypeOf, test, vi } from 'vitest';

import jestExpress, {
  configure,
  createNext,
  createRequest,
  createResponse,
  type MockControls,
  type MockFactory,
  type MockFn,
  type MockRequest,
  type MockResponse,
  Request,
  Response,
  Router,
} from '../../src';

describe('assignable to Express types', () => {
  test('createRequest() is an express.Request', () => {
    expectTypeOf(createRequest()).toExtend<express.Request>();
  });

  test('createResponse() is an express.Response', () => {
    expectTypeOf(createResponse()).toExtend<express.Response>();
  });

  test('createNext() is an express.NextFunction', () => {
    expectTypeOf(createNext()).toExtend<express.NextFunction>();
  });

  test('express() is an express.Express and Router() is an express.Router', () => {
    expectTypeOf(jestExpress()).toExtend<express.Express>();
    expectTypeOf(Router()).toExtend<express.Router>();
    expectTypeOf(jestExpress().request).toExtend<express.Request>();
  });

  test('mocks can be passed to handlers without casts', () => {
    const handler: express.RequestHandler = (_req, res, next) => {
      res.status(200).json({ ok: true });
      next();
    };
    const errorHandler: express.ErrorRequestHandler = (_err, _req, _res, next) => next();
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    handler(req, res, next);
    errorHandler(new Error('boom'), req, res, next);
  });

  test('module-level middleware keeps the Express signatures', () => {
    expectTypeOf(jestExpress.json).toExtend<typeof express.json>();
    expectTypeOf(jestExpress.urlencoded).toExtend<typeof express.urlencoded>();
    expectTypeOf(jestExpress.static).toExtend<typeof express.static>();
    expectTypeOf(jestExpress.text).toExtend<typeof express.text>();
    expectTypeOf(jestExpress.raw).toExtend<typeof express.raw>();
  });

  test('app.router keeps the Express Router type', () => {
    const app = jestExpress();
    expectTypeOf(app.router).toExtend<express.Router>();
    expectTypeOf(app.router.get).toExtend<express.Router['get']>();
    expectTypeOf(app.router.use).toExtend<express.Router['use']>();
  });
});

describe('mock API', () => {
  test('configure() accepts vi.fn', () => {
    configure({ fn: vi.fn });
  });

  test('mocked methods expose the mock controls', () => {
    const res = createResponse();
    res.status.mockReturnValue(res);
    expectTypeOf(res.status.mock.calls).toEqualTypeOf<[code: number][]>();
    expectTypeOf(createRequest().get.mockClear).toBeFunction();
  });

  test('mocked methods are typed, not any', () => {
    const res = createResponse();
    // @ts-expect-error status() takes a number
    res.status('404');
    expectTypeOf(res.status(404)).toExtend<express.Response>();
  });

  test('bare MockFn, MockControls and MockFactory default to unknown, not any', () => {
    expectTypeOf<ReturnType<MockFn>>().toBeUnknown();
    expectTypeOf<Parameters<MockFn>>().toEqualTypeOf<unknown[]>();
    expectTypeOf<MockControls['mock']['calls']>().toEqualTypeOf<unknown[][]>();
    expectTypeOf<ReturnType<ReturnType<MockFactory>>>().toBeUnknown();
    expectTypeOf(jestExpress).not.toHaveProperty('query');
  });

  test('next.mock.calls records any argument, not the literal "route"', () => {
    const next = createNext();
    expectTypeOf(next.mock.calls).toEqualTypeOf<[err?: unknown][]>();
    const recorded: unknown = next.mock.calls[0]?.[0];
    expectTypeOf(recorded).toBeUnknown();
    expectTypeOf(next).toExtend<express.NextFunction>();
  });

  test('deprecated constructors produce the same mock types', () => {
    expectTypeOf(new Request()).toEqualTypeOf<MockRequest>();
    expectTypeOf(new Response()).toEqualTypeOf<MockResponse>();
    expectTypeOf(jestExpress.Request).toEqualTypeOf(Request);
  });
});
