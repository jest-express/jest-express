import api from './api';
import type * as mock from './mock';
import type * as types from './types';

// CommonJS entry: a single default export becomes `module.exports`, so
// `require('express-mock-core')` is the callable `express()` mock with every helper attached.
const express = api;

// The namespace below re-exports these under their public names. They go through
// differently-named aliases because the d.ts bundler flattens `types.X` to `X`, which would
// turn `type X = types.X` inside the namespace into a circular `type X = X`.
type CjsConfigureOptions = mock.ConfigureOptions;
type CjsMockControls = mock.MockControls;
type CjsMockFactory = mock.MockFactory;
type CjsMockFn<T extends mock.Procedure> = mock.MockFn<T>;
type CjsExpressConstructor = types.ExpressConstructor;
type CjsJestExpress = types.JestExpress;
type CjsMockExpress = types.MockExpress;
type CjsMockNextFunction = types.MockNextFunction;
type CjsMockRequest = types.MockRequest;
type CjsMockResponse = types.MockResponse;
type CjsMockRouter = types.MockRouter;
type CjsRequestConstructor = types.RequestConstructor;
type CjsRequestOptions = types.RequestOptions;
type CjsResponseConstructor = types.ResponseConstructor;

// Type-only namespace, so CommonJS TypeScript users can write `express.MockRequest`.
declare namespace express {
  export type ConfigureOptions = CjsConfigureOptions;
  export type MockControls = CjsMockControls;
  export type MockFactory = CjsMockFactory;
  export type MockFn<T extends mock.Procedure = mock.UnknownProcedure> = CjsMockFn<T>;
  export type ExpressConstructor = CjsExpressConstructor;
  export type JestExpress = CjsJestExpress;
  export type MockExpress = CjsMockExpress;
  export type MockNextFunction = CjsMockNextFunction;
  export type MockRequest = CjsMockRequest;
  export type MockResponse = CjsMockResponse;
  export type MockRouter = CjsMockRouter;
  export type RequestConstructor = CjsRequestConstructor;
  export type RequestOptions = CjsRequestOptions;
  export type ResponseConstructor = CjsResponseConstructor;
}

export default express;
