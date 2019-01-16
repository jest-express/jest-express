import { next, NextFunction } from './next';
import { Request } from './request';
import { Response } from './response';

declare const jest: any;

// https://expressjs.com/en/4x/api.html#router
export class Router {
  public request: Request;
  public response: Response;
  public next: NextFunction;
  public all: any;
  public get: any;
  public param: any;
  public route: any;
  public use: any;
  public post: any;
  public put: any;
  public patch: any;
  public delete: any;

  constructor() {
    const handler = (path: any, ...callbacks: any): void => {
      const flattened = [].concat(...callbacks); // flatten array
      if (typeof path === 'string' && flattened.every((cb: any) => typeof cb === 'function')) {
        flattened.forEach((cb: any) => cb(this.request, this.response, this.next));
      } else {
        path(this.request, this.response, this.next);
      }
    };

    const del: any = jest.fn(handler).mockName('del');
    const get: any = jest.fn(handler).mockName('get');
    const patch: any = jest.fn(handler).mockName('patch');
    const post: any = jest.fn(handler).mockName('post');
    const put: any = jest.fn(handler).mockName('put');

    this.request = new Request();
    this.response = new Response();
    this.next = next;
    this.param = jest.fn();
    this.all = jest.fn();
    this.use = jest.fn();
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
     * we have to be crafty with what 'this/that' means, in order to avoid
     * referring to myself, and triggering an inifinite recursion.
     */
    this.route = jest.fn((path: string) => {

      // return an object that proxies the other functions,
      // and returns a copy of me, not the Router
      return {
        delete(cb: any) {
          del(path, cb);
          return this;
        },
        get(cb: any) {
          get(path, cb);
          return this;
        },
        patch(cb: any) {
          patch(path, cb);
          return this;
        },
        post(cb: any) {
          post(path, cb);
          return this;
        },
        put(cb: any) {
          put(path, cb);
          return this;
        },
      };
    });
    return this;
  }

  public resetMocked() {
    this.all.mockReset();
    this.get.mockReset();
    this.param.mockReset();
    this.route.mockReset();
    this.use.mockReset();
  }
}
