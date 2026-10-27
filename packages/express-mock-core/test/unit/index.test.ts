import { describe, expect, test, vi } from 'vitest';

import express, * as named from '../../src';
import { Express as RealExpress } from '../../src/express';
import cjsExpress from '../../src/index.cjs';
import { createNext as RealCreateNext } from '../../src/next';
import { Request as RealRequest } from '../../src/request';
import { Response as RealResponse } from '../../src/response';
import { Router as RealRouter } from '../../src/router';

describe('Exporter', () => {
  test('express.query and app.del stay absent in Express 5', () => {
    expect('query' in express).toBe(false);
    expect('del' in express()).toBe(false);
  });

  test('Default export is a instance of express', () => {
    expect(express()).toBeInstanceOf(RealExpress);
  });

  test('Router is a instance of Router class', () => {
    expect(express.Router()).toBeInstanceOf(RealRouter);
  });

  test('Response is a instance of Response class', () => {
    expect(express.Response).toEqual(RealResponse);
  });

  test('Express is a instance of Express class', () => {
    expect(express.Express).toEqual(RealExpress);
  });

  test('Request is a instance of Request class', () => {
    expect(express.Request).toEqual(RealRequest);
  });

  test('createNext is exported', () => {
    expect(express.createNext).toEqual(RealCreateNext);
  });

  test('express.json is the same mock on every access', () => {
    expect(express.json).toBe(express.json);
  });

  test('express.text and express.raw are the same mocks on every access', () => {
    expect(express.text).toBe(express.text);
    expect(express.raw).toBe(express.raw);
    expect(express.text).not.toBe(express.raw);
  });

  test('resetMocked() clears the middleware mocks', () => {
    express.json({ limit: '1mb' });
    express.static('public');

    express.resetMocked();

    expect(express.json).not.toHaveBeenCalled();
    expect(express.static).not.toHaveBeenCalled();
  });

  test('resetMocked() clears the text and raw middleware mocks', () => {
    express.text({ type: 'text/html' });
    express.raw({ limit: '1mb' });

    express.resetMocked();

    expect(express.text).not.toHaveBeenCalled();
    expect(express.raw).not.toHaveBeenCalled();
  });

  test('express.default is express itself, for CommonJS interop', () => {
    expect(express.default).toBe(express);
  });

  test('the CommonJS entry exports the same callable express mock', () => {
    expect(cjsExpress).toBe(express);
  });

  test('named exports are the same objects as the default export properties', () => {
    for (const name of [
      'configure',
      'createNext',
      'createRequest',
      'createResponse',
      'Express',
      'Request',
      'Response',
      'Router',
      'resetMocked',
    ] as const) {
      expect(named[name]).toBe(express[name]);
    }
  });

  test('createRequest(url, options) builds a parsed Request', () => {
    const req = express.createRequest('/users?id=1', { method: 'POST' });

    expect(req).toBeInstanceOf(RealRequest);
    expect(req.path).toBe('/users');
    expect(req.query).toEqual({ id: '1' });
    expect(req.method).toBe('POST');
  });

  test('createResponse() builds a Response', () => {
    expect(express.createResponse()).toBeInstanceOf(RealResponse);
  });

  test.each(['json', 'urlencoded', 'static', 'text', 'raw'] as const)(
    'express.%s() returns a pass-through middleware that calls next',
    (name) => {
      const middleware = express[name]();
      const next = express.createNext();

      middleware(express.createRequest(), express.createResponse(), next);

      expect(middleware).toBe(express[name]());
      expect(next).toHaveBeenCalledTimes(1);
    },
  );

  test('app.use(express.json(), handler) runs the handler and can be asserted', () => {
    const app = express();
    const handler = vi.fn();

    app.use(express.json(), handler);

    expect(app.use).toHaveBeenCalledWith(express.json(), handler);
    expect(express.json()).toHaveBeenCalledWith(app.request, app.response, expect.any(Function));
    expect(handler).toHaveBeenCalled();
  });

  test('express.resetMocked() clears the middleware but keeps it working', () => {
    const middleware = express.json();
    middleware(express.createRequest(), express.createResponse(), express.createNext());

    express.resetMocked();

    expect(middleware).not.toHaveBeenCalled();
    expect(express.json()).toBe(middleware);
    const next = express.createNext();
    middleware(express.createRequest(), express.createResponse(), next);
    expect(next).toHaveBeenCalled();
  });
});
