import * as Chance from 'chance';

import { next, NextFunction } from '../../src/next';
import { Request } from '../../src/request';
import { Response } from '../../src/response';
import { Router } from '../../src/router';

const chance = new Chance();
let router: any;

describe('Express Router', () => {
  beforeEach(() => {
    router = new Router();
  });

  afterEach(() => {
    router.resetMocked();
  });

  test('all', () => {
    router.all('title');
    expect(router.all).toHaveBeenCalled();
    expect(router.all).toHaveBeenCalledWith('title');
  });

  test('get', () => {
    router.get('/', (request: Request, response: Response, next: NextFunction) => {
      expect(router.get).toHaveBeenCalled();
      expect(router.get).toHaveBeenCalledWith('/', expect.anything());
      expect(request).toBeInstanceOf(Request);
      expect(response).toBeInstanceOf(Response);
      expect(response).toBeInstanceOf(Response);
      expect(next).toEqual(next);
    });
  });

  test('get without path', () => {
    router.get((request: Request, response: Response, next: NextFunction) => {
      expect(router.get).toHaveBeenCalled();
      expect(router.get).toHaveBeenCalledWith(expect.anything());
      expect(request).toBeInstanceOf(Request);
      expect(response).toBeInstanceOf(Response);
      expect(response).toBeInstanceOf(Response);
      expect(next).toEqual(next);
    });
  });

  test('param', () => {
    router.param('title');
    expect(router.param).toHaveBeenCalled();
    expect(router.param).toHaveBeenCalledWith('title');
  });

  describe('Route', () => {
    let path: string = '/events';

    beforeAll(() => {
      path = '/events';
    });

    ['get', 'post', 'put', 'patch', 'delete'].forEach((verb: string) => {
      test(verb, () => {
        router.route(path)[verb]((request: any, response: any) => {
          expect(router.route).toHaveBeenCalled();
          expect(router.route).toHaveBeenCalledWith(path);
          expect(router[verb]).toHaveBeenCalled();
          expect(router[verb]).toHaveBeenCalledWith(path, expect.any(Function));
          expect(request).toBeInstanceOf(Request);
          expect(response).toBeInstanceOf(Response);
        });
      });
    });

  });

  test('use', () => {
    router.use('/events');
    expect(router.use).toHaveBeenCalled();
    expect(router.use).toHaveBeenCalledWith('/events');
  });
});
