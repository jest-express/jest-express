import type * as express from 'express';
import type { ConfigureOptions, MockFn, Procedure } from './mock';

/** Replace the methods `K` of `T` with mocks of the same type. */
type WithMocked<T, K extends keyof T> = {
  [P in K]: T[P] extends Procedure ? MockFn<T[P]> : never;
};

type KeyOrRecord = string | { [key: string]: string };

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' | 'HEAD' | 'OPTIONS' | 'CONNECT';
  headers?: Record<string, string | string[] | undefined>;
  app?: MockExpress;
}

export interface RequestHelpers {
  setUrl(url: string, options?: RequestOptions): void;
  resetMocked(): void;
  setBaseUrl(value: string): void;
  setBody(value: unknown): void;
  setCookies(key: KeyOrRecord, value?: string): void;
  setFresh(value: boolean): void;
  setHeaders(key: KeyOrRecord, value?: string): void;
  setHostname(value: string): void;
  setIp(value: string): void;
  setIps(value: string): void;
  setMethod(value: string): void;
  setOriginalUrl(value: string): void;
  setParams(key: KeyOrRecord, value?: string): void;
  setPath(value: string): void;
  setProtocol(value: string): void;
  setQuery(key: KeyOrRecord, value?: string): void;
  setRoute(key: KeyOrRecord, value?: string): void;
  setSecure(value: boolean): void;
  setSignedCookies(key: KeyOrRecord, value?: string): void;
  setStale(value: boolean): void;
  setSubdomains(value: string): void;
  setXhr(value: boolean): void;
}

export type MockRequest = express.Request &
  WithMocked<
    express.Request,
    | 'accepts'
    | 'acceptsCharsets'
    | 'acceptsEncodings'
    | 'acceptsLanguages'
    | 'get'
    | 'header'
    | 'is'
    | 'range'
  > &
  RequestHelpers & { app: MockExpress };

export interface ResponseHelpers {
  /** The last value passed to `send`, `json`, `jsonp`, `text` or `end`. */
  body: unknown;
  /** Stored response headers, keyed by lower-case names like Node's `getHeaders()`. */
  headers: Record<string, unknown>;
  text: MockFn<(body?: unknown) => MockResponse>;
  setHeadersSent(value: boolean): void;
  setLocals(key: string, value: string): void;
  resetMocked(): void;
}

export type MockResponse = express.Response &
  WithMocked<
    express.Response,
    | 'append'
    | 'attachment'
    | 'cookie'
    | 'clearCookie'
    | 'download'
    | 'end'
    | 'format'
    | 'get'
    | 'header'
    | 'json'
    | 'jsonp'
    | 'links'
    | 'location'
    | 'redirect'
    | 'render'
    | 'send'
    | 'sendFile'
    | 'sendStatus'
    | 'set'
    | 'setHeader'
    | 'status'
    | 'type'
    | 'vary'
    | 'removeHeader'
  > &
  ResponseHelpers;

/**
 * Express's `next`, plus mock controls typed for how it's really called: `next()`,
 * `next(err)`, `next('route')` or `next('router')`. (Deriving them from `NextFunction`'s
 * overloads would type every recorded argument as `'route'`.)
 */
export type MockNextFunction = express.NextFunction & MockFn<(err?: unknown) => void>;

export interface ExpressHelpers {
  request: MockRequest;
  response: MockResponse;
  /** The app's base router, created lazily on first read; `resetMocked()` resets its mocks. */
  router: MockRouter;
  next: MockNextFunction;
  /**
   * @deprecated No longer passed to error handlers. As in Express, an `(err, req, res, next)`
   * handler only runs after `next(err)`, a thrown error or a rejected promise.
   */
  error: Record<string, unknown>;
  setMountPath(value: string): void;
  setLocals(key: string, value: string): void;
  /** @deprecated See `error`. */
  setError(key: string, value: string): void;
  resetMocked(): void;
}

export type MockExpress = express.Express &
  WithMocked<
    express.Express,
    | 'all'
    | 'delete'
    | 'disable'
    | 'disabled'
    | 'enable'
    | 'enabled'
    | 'engine'
    | 'get'
    | 'listen'
    | 'head'
    | 'post'
    | 'put'
    | 'connect'
    | 'options'
    | 'trace'
    | 'patch'
    | 'param'
    | 'path'
    | 'render'
    | 'route'
    | 'set'
    | 'use'
  > &
  ExpressHelpers;

export interface RouterHelpers {
  request: MockRequest;
  response: MockResponse;
  next: MockNextFunction;
  resetMocked(): void;
}

export type MockRouter = express.Router &
  WithMocked<
    express.Router,
    'all' | 'get' | 'param' | 'route' | 'use' | 'post' | 'put' | 'patch' | 'delete'
  > &
  RouterHelpers;

export interface ExpressConstructor {
  new (): MockExpress;
  prototype: MockExpress;
}

export interface RequestConstructor {
  /** @deprecated Use `createRequest(url, options)` instead. */
  new (url?: string | null, options?: RequestOptions): MockRequest;
  prototype: MockRequest;
}

export interface ResponseConstructor {
  /** @deprecated Use `createResponse()` instead. */
  new (): MockResponse;
  prototype: MockResponse;
}

/** The default export: a mock `express()` with the module's helpers attached. */
export interface JestExpress {
  (): MockExpress;
  default: JestExpress;
  configure(options: ConfigureOptions): void;
  createRequest(url?: string | null, options?: RequestOptions): MockRequest;
  createResponse(): MockResponse;
  createNext(): MockNextFunction;
  Express: ExpressConstructor;
  /** @deprecated Use `createRequest()` instead. */
  Request: RequestConstructor;
  /** @deprecated Use `createResponse()` instead. */
  Response: ResponseConstructor;
  Router(): MockRouter;
  json: MockFn<typeof express.json>;
  raw: MockFn<typeof express.raw>;
  static: MockFn<typeof express.static>;
  text: MockFn<typeof express.text>;
  urlencoded: MockFn<typeof express.urlencoded>;
  /** Reset the module-level middleware mocks (`json`, `static`, ...). */
  resetMocked(): void;
}
