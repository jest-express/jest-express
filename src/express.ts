import { next, NextFunction } from './next';
import { Request } from './request';
import { Response } from './response';

declare const jest: any;

// https://expressjs.com/en/4x/api.html#app
export class Express {
  // Properties
  public error: any;
  public locals: any;
  public mountpath: string;
  // Methods
  public all: any;
  public delete: any;
  public disable: any;
  public disabled: any;
  public enable: any;
  public enabled: any;
  public engine: any;
  public get: any;
  public listen: any;
  public head: any;
  public post: any;
  public put: any;
  public connect: any;
  public options: any;
  public trace: any;
  public patch: any;
  public param: any;
  public path: any;
  public render: any;
  public route: any;
  public set: any;
  public use: any;
  // Class
  public request: Request;
  public response: Response;
  public next: NextFunction;
  // Private
  private setting: any;

  constructor() {
    this.request = new Request(null, { app: this });
    this.response = new Response();
    this.next = next;
    // Properties
    this.locals = {};
    this.error = {};
    this.mountpath = '';
    this.setting = {};
    // Methods
    this.all = jest.fn();
    this.delete = jest.fn();
    this.disable = jest.fn((key: any) => {
      this.setting[key] = false;
    });
    this.disabled = jest.fn((key: any) => {
      return this.setting[key] === false;
    });
    this.enable = jest.fn((key: any) => {
      this.setting[key] = true;
    });
    this.enabled = jest.fn((key: any) => {
      return this.setting[key] === true;
    });
    this.engine = jest.fn();
    // TODO app.listen(port, [hostname], [backlog], [callback])
    this.listen = jest.fn();
    this.head = jest.fn();
    this.post = jest.fn();
    this.put = jest.fn();
    this.connect = jest.fn();
    this.options = jest.fn();
    this.trace = jest.fn();
    this.patch = jest.fn();
    this.param = jest.fn();
    // TODO app.path()
    this.path = jest.fn();
    // TODO app.render(view, [locals], callback)
    this.render = jest.fn();
    this.use = jest.fn((func: any) => {
      if (typeof func === 'function' && func.length === 3) {
        return func(this.request, this.response, this.next);
      }
      if (typeof func === 'function' && func.length === 4) {
        return func(this.error, this.request, this.response, this.next);
      }
      return;
    });
    this.get = jest.fn((path: any, ...callbacks: any) => {
      if (typeof path === 'string' && callbacks.length === 0) {
        return this.setting[path];
      }
      const flattened = [].concat(...callbacks) as any[]; // flatten array
      if (typeof path === 'string' && flattened.every((cb: any) => typeof cb === 'function')) {
        return flattened.length === 1 ?
          flattened[0](this.request, this.response)
          : flattened.map((cb: any) => cb(this.request, this.response));
      }
      return path(this.request, this.response);
    });
    // TODO app.route(path)
    this.route = jest.fn(() => {
      return {
        delete: this.delete,
        get: this.get,
        post: this.post,
        put: this.put,
      };
    });

    this.set = jest.fn((key: any, value: any) => {
      this.setting[key] = value;
    });
    return this;
  }

  public setMountPath(value: string) {
    this.mountpath = value;
  }

  public setLocals(key: string, value: string) {
    this.locals[key] = value;
  }

  public setError(key: string, value: string) {
    this.error[key] = value;
  }

  public resetMocked() {
    // Properties
    this.locals = {};
    this.error = {};
    this.mountpath = '';
    // Methods
    this.all.mockReset();
    this.delete.mockReset();
    this.disable.mockReset();
    this.disabled.mockReset();
    this.enable.mockReset();
    this.enabled.mockReset();
    this.engine.mockReset();
    this.listen.mockReset();
    this.head.mockReset();
    this.post.mockReset();
    this.put.mockReset();
    this.connect.mockReset();
    this.options.mockReset();
    this.trace.mockReset();
    this.patch.mockReset();
    this.param.mockReset();
    this.path.mockReset();
    this.render.mockReset();
    this.use.mockReset();
    this.get.mockReset();
    this.route.mockReset();
    this.set.mockReset();
    // Class
    this.request.resetMocked();
    this.response.resetMocked();
    this.next.mockReset();
    // Private
    this.setting = {};
  }
}
