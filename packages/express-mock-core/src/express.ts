import { dispatch } from './dispatch';
import { createMock, type MockFn, type Procedure, resetMock } from './mock';
import { createNext, type NextFunction } from './next';
import { Request } from './request';
import { Response } from './response';
import { Router } from './router';
import type { MockExpress } from './types';

// Mirror Express's compileTrust (lib/utils.js) for the values unit tests use: functions
// pass through, `true` trusts every hop, numbers trust the first N hops, and falsy values
// trust nothing. proxyaddr string subnet lists are out of scope; truthy strings trust all.
function compileTrust(value: unknown): (address?: string, hop?: number) => boolean {
  if (typeof value === 'function') {
    return value as (address?: string, hop?: number) => boolean;
  }
  if (typeof value === 'number') {
    return (_address, hop = 0) => hop < value;
  }
  return () => Boolean(value);
}

// https://expressjs.com/en/4x/api.html#app
export class Express {
  // Properties
  public error: Record<string, unknown>;

  public locals: Record<string, unknown>;

  public mountpath: string;

  // Methods
  public all: MockFn<Procedure>;

  public delete: MockFn<Procedure>;

  public disable: MockFn<Procedure>;

  public disabled: MockFn<Procedure>;

  public enable: MockFn<Procedure>;

  public enabled: MockFn<Procedure>;

  public engine: MockFn<Procedure>;

  public get: MockFn<Procedure>;

  public listen: MockFn<Procedure>;

  public head: MockFn<Procedure>;

  public post: MockFn<Procedure>;

  public put: MockFn<Procedure>;

  public connect: MockFn<Procedure>;

  public options: MockFn<Procedure>;

  public trace: MockFn<Procedure>;

  public patch: MockFn<Procedure>;

  public param: MockFn<Procedure>;

  public path: MockFn<Procedure>;

  public render: MockFn<Procedure>;

  public route: MockFn<Procedure>;

  public set: MockFn<Procedure>;

  public use: MockFn<Procedure>;

  // Class
  public request: Request;

  public response: Response;

  public next: NextFunction;

  // Private
  private setting: Record<string, unknown>;

  private routerValue?: Router;

  constructor() {
    // `this` is the runtime object behind the public MockExpress view.
    this.request = new Request(null, { app: this as unknown as MockExpress });
    this.response = new Response();
    this.next = createNext();
    // Properties
    this.locals = {};
    this.error = {};
    this.mountpath = '';
    this.setting = {};
    // Methods
    // app.use and app.METHOD run their handlers like an Express route and return the app.
    const handle = (...args: unknown[]) => {
      dispatch(args, {
        request: this.request,
        response: this.response,
        next: this.next,
      });
      return this;
    };
    this.all = createMock(handle);
    this.delete = createMock(handle);
    this.disable = createMock((key: string) => this.set(key, false));
    this.disabled = createMock((key: string) => this.setting[key] === false);
    this.enable = createMock((key: string) => this.set(key, true));
    this.enabled = createMock((key: string) => this.setting[key] === true);
    this.engine = createMock();
    // TODO app.listen(port, [hostname], [backlog], [callback])
    this.listen = createMock();
    this.head = createMock(handle);
    this.post = createMock(handle);
    this.put = createMock(handle);
    this.connect = createMock(handle);
    this.options = createMock(handle);
    this.trace = createMock(handle);
    this.patch = createMock(handle);
    this.param = createMock();
    // TODO app.path()
    this.path = createMock();
    // TODO app.render(view, [locals], callback)
    this.render = createMock();
    this.use = createMock(handle);
    // app.get(name) with a single argument reads a setting.
    this.get = createMock((path: unknown, ...callbacks: unknown[]) =>
      typeof path === 'string' && callbacks.length === 0
        ? this.setting[path]
        : handle(path, ...callbacks),
    );
    // TODO app.route(path)
    this.route = createMock(() => ({
      delete: this.delete,
      get: this.get,
      post: this.post,
      put: this.put,
    }));

    // Like Express, app.set(name) reads a setting and app.set(name, value) returns the app.
    this.set = createMock((...args: [key: string, value?: unknown]) => {
      const [key, value] = args;
      if (args.length === 1) {
        return this.setting[key];
      }
      if (key === 'trust proxy') {
        // Like Express, compile the setting into the function req.host consults.
        this.setting['trust proxy fn'] = compileTrust(value);
      }
      this.setting[key] = value;
      return this;
    });
  }

  /**
   * Express 5 exposes the app's base router lazily. The same object is returned on every
   * read; `app.resetMocked()` resets its mocks without replacing it.
   */
  public get router(): Router {
    if (!this.routerValue) {
      this.routerValue = new Router();
    }
    return this.routerValue;
  }

  // Internal settings accessor for Request getters such as `host`, so they don't
  // record calls on the mocked `app.get`.
  public getSetting(key: string): unknown {
    return this.setting[key];
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
    resetMock(this.all);
    resetMock(this.delete);
    resetMock(this.disable);
    resetMock(this.disabled);
    resetMock(this.enable);
    resetMock(this.enabled);
    resetMock(this.engine);
    resetMock(this.listen);
    resetMock(this.head);
    resetMock(this.post);
    resetMock(this.put);
    resetMock(this.connect);
    resetMock(this.options);
    resetMock(this.trace);
    resetMock(this.patch);
    resetMock(this.param);
    resetMock(this.path);
    resetMock(this.render);
    resetMock(this.use);
    resetMock(this.get);
    resetMock(this.route);
    resetMock(this.set);
    // Class
    this.request.resetMocked();
    this.response.resetMocked();
    resetMock(this.next);
    this.routerValue?.resetMocked();
    // Private
    this.setting = {};
  }
}
