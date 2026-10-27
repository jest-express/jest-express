import { createMock, type MockFn, resetMock } from './mock';

type Middleware = (req: unknown, res: unknown, next: () => void) => void;

// Each factory (express.json() etc.) returns the same pass-through middleware, so
// `app.use(express.json())` runs the next handler, and a test can assert
// `expect(app.use).toHaveBeenCalledWith(express.json())`. It doesn't parse anything.
const createPassThrough = (): MockFn<Middleware> =>
  createMock<Middleware>((_req, _res, next) => next());

export class Application {
  public json: MockFn<() => MockFn<Middleware>>;

  public raw: MockFn<() => MockFn<Middleware>>;

  public staticLoad: MockFn<() => MockFn<Middleware>>;

  public text: MockFn<() => MockFn<Middleware>>;

  public urlencoded: MockFn<() => MockFn<Middleware>>;

  private middleware: MockFn<Middleware>[];

  constructor() {
    const json = createPassThrough();
    const raw = createPassThrough();
    const staticLoad = createPassThrough();
    const text = createPassThrough();
    const urlencoded = createPassThrough();
    this.middleware = [json, raw, staticLoad, text, urlencoded];
    this.json = createMock(() => json);
    this.raw = createMock(() => raw);
    this.staticLoad = createMock(() => staticLoad);
    this.text = createMock(() => text);
    this.urlencoded = createMock(() => urlencoded);
  }

  public resetMocked() {
    resetMock(this.json);
    resetMock(this.raw);
    resetMock(this.staticLoad);
    resetMock(this.text);
    resetMock(this.urlencoded);
    for (const middleware of this.middleware) {
      resetMock(middleware);
    }
  }
}
