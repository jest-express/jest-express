import { Application } from './application';
import { Express as ExpressMock } from './express';
import { configure } from './mock';
import { createNext } from './next';
import { Request as RequestMock } from './request';
import { Response as ResponseMock } from './response';
import { Router as RouterMock } from './router';
import type {
  ExpressConstructor,
  JestExpress,
  MockExpress,
  MockRequest,
  MockResponse,
  MockRouter,
  RequestConstructor,
  RequestOptions,
  ResponseConstructor,
} from './types';

// The mock classes don't implement every member of the Express interfaces (streams, sockets
// and so on). These casts give users the Express-assignable view described in ./types.
export const Express = ExpressMock as unknown as ExpressConstructor;
export const Request = RequestMock as unknown as RequestConstructor;
export const Response = ResponseMock as unknown as ResponseConstructor;

/**
 * Create a mock request, optionally parsed from `url`.
 */
export function createRequest(url?: string | null, options?: RequestOptions): MockRequest {
  return new RequestMock(url, options) as unknown as MockRequest;
}

/**
 * Create a mock response.
 */
export function createResponse(): MockResponse {
  return new ResponseMock() as unknown as MockResponse;
}

/**
 * Create a mock router.
 */
export function Router(): MockRouter {
  return new RouterMock() as unknown as MockRouter;
}

/**
 * Create a mock express application.
 */
function createApplication(): MockExpress {
  return new ExpressMock() as unknown as MockExpress;
}

/**
 * Module-level middleware. The mocks are created on first access, not at import.
 */
let application: Application | undefined;
const getApplication = () => {
  if (!application) {
    application = new Application();
  }
  return application;
};

export function resetMocked(): void {
  getApplication().resetMocked();
}

// The middleware getters are defined below, so the cast covers them.
const express = Object.assign(createApplication, {
  configure,
  createRequest,
  createResponse,
  createNext,
  Express,
  Request,
  Response,
  Router,
  resetMocked,
}) as JestExpress;

express.default = express;

const middleware = {
  json: 'json',
  raw: 'raw',
  static: 'staticLoad',
  text: 'text',
  urlencoded: 'urlencoded',
} as const;
for (const [name, key] of Object.entries(middleware)) {
  Object.defineProperty(express, name, { enumerable: true, get: () => getApplication()[key] });
}

export default express;
