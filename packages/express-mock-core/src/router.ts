import { dispatch } from './dispatch';
import { createMock, type MockFn, type Procedure, resetMock } from './mock';
import { createNext, type NextFunction } from './next';
import { Request } from './request';
import { Response } from './response';

// https://expressjs.com/en/4x/api.html#router
export class Router {
  public request: Request;

  public response: Response;

  public next: NextFunction;

  public all: MockFn<Procedure>;

  public get: MockFn<Procedure>;

  public param: MockFn<Procedure>;

  public route: MockFn<Procedure>;

  public use: MockFn<Procedure>;

  public post: MockFn<Procedure>;

  public put: MockFn<Procedure>;

  public patch: MockFn<Procedure>;

  public delete: MockFn<Procedure>;

  constructor() {
    // router.use and router.METHOD run their handlers like an Express route and return the router.
    const handler = (...args: unknown[]) => {
      dispatch(args, {
        request: this.request,
        response: this.response,
        next: this.next,
      });
      return this;
    };

    const del = createMock(handler, 'del');
    const get = createMock(handler, 'get');
    const patch = createMock(handler, 'patch');
    const post = createMock(handler, 'post');
    const put = createMock(handler, 'put');

    this.request = new Request();
    this.response = new Response();
    this.next = createNext();
    this.param = createMock();
    this.all = createMock(handler);
    this.use = createMock(handler);
    this.delete = del;
    this.get = get;
    this.post = post;
    this.put = put;
    this.patch = patch;

    /**
     * @method route
     * @param path - the path or thing our route needs
     * @desc should expose and object containing pointers to each
     * HTTP method outlined above. (eg. get, put, post)
     * @note since we're returning another object to create a chain,
     * we have to be crafty with what 'this/that' means, to avoid
     * referring to myself and triggering an infinite recursion.
     */
    this.route = createMock((path: string) =>
      // return an object that proxies the other functions
      // and returns a copy of me, not the Router
      ({
        delete(cb: unknown) {
          del(path, cb);
          return this;
        },
        get(cb: unknown) {
          get(path, cb);
          return this;
        },
        patch(cb: unknown) {
          patch(path, cb);
          return this;
        },
        post(cb: unknown) {
          post(path, cb);
          return this;
        },
        put(cb: unknown) {
          put(path, cb);
          return this;
        },
      }),
    );
  }

  public resetMocked() {
    resetMock(this.all);
    resetMock(this.get);
    resetMock(this.param);
    resetMock(this.route);
    resetMock(this.use);
    resetMock(this.post);
    resetMock(this.put);
    resetMock(this.patch);
    resetMock(this.delete);
    resetMock(this.next);
    this.request.resetMocked();
    this.response.resetMocked();
  }
}
