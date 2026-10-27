import Chance from 'chance';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { Response } from '../../src/response';

const chance = new Chance();
let response: Response;

describe('Express Response', () => {
  beforeEach(() => {
    response = new Response();
  });

  afterEach(() => {
    response.resetMocked();
  });

  describe('Express 5 removals and behaviour changes', () => {
    test('res.sendfile stays absent in Express 5', () => {
      expect('sendfile' in response).toBe(false);
    });

    test.each([false, true])(
      'legacy body/status arguments follow Express 5 after reset=%s',
      (reset) => {
        if (reset) response.resetMocked();
        expect(response.send(404)).toBe(response);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(404);
        expect(response.get('Content-Type')).toBe('application/json; charset=utf-8');
        for (const method of ['send', 'json', 'jsonp']) {
          response.resetMocked();
          const body = method === 'send' ? 'hello' : { ok: true };
          expect(response[method](body, 201)).toBe(response);
          expect(response.statusCode).toBe(200);
          expect(response.body).toEqual(body);
        }
        expect(response.get('X-Content-Type-Options')).toBe('nosniff');
      },
    );

    test('res.redirect(url, status) throws after setting Location like Express 5', () => {
      for (const reset of [false, true]) {
        if (reset) response.resetMocked();
        expect(() => response.redirect('/x', 301)).toThrow(
          new TypeError('Invalid status code: "/x". Status code must be an integer.'),
        );
        expect(response.statusCode).toBe(200);
        expect(response.get('Location')).toBe('301');
        expect(response.get('Vary')).toBe('Accept');
        expect(response.get('Content-Type')).toBe('text/plain; charset=utf-8');
      }
    });

    test('res.redirect and res.location treat back as a literal path like Express 5', () => {
      for (const reset of [false, true]) {
        if (reset) response.resetMocked();
        expect(response.location('back')).toBe(response);
        expect(response.get('Location')).toBe('back');
        expect(response.redirect('back')).toBeUndefined();
        expect(response.statusCode).toBe(302);
        expect(response.get('Location')).toBe('back');
        expect(response.body).toBe('Found. Redirecting to back');
        expect(response.get('Content-Length')).toBe('26');
      }
    });

    test.each([undefined, null, '404', 200.5, NaN, Infinity, 99, 1000])(
      'res.status(%s), sendStatus and redirect validate status like Express 5',
      (code) => {
        const integer = Number.isInteger(code);
        const error = integer
          ? new RangeError(
              `Invalid status code: ${JSON.stringify(code)}. Status code must be greater than 99 and less than 1000.`,
            )
          : new TypeError(
              `Invalid status code: ${JSON.stringify(code)}. Status code must be an integer.`,
            );
        for (const method of ['status', 'sendStatus', 'redirect']) {
          for (const reset of [false, true]) {
            if (reset) response[method].mockReturnValue(undefined);
            response.resetMocked();
            expect(() =>
              method === 'redirect' ? response.redirect(code, '/x') : response[method](code),
            ).toThrow(error);
            expect(response.statusCode).toBe(200);
            if (method === 'sendStatus') expect(response.headers).toEqual({});
            if (method === 'redirect') expect(response.get('Location')).toBe('/x');
          }
        }
      },
    );

    test.each([100, 999])('res.status(%i) accepts the Express 5 boundary', (code) => {
      expect(response.status(code)).toBe(response);
      expect(response.statusCode).toBe(code);
    });

    test.each([undefined, null, '', false, 0])(
      'res.vary(%s) throws for a missing field like Express 5',
      (field) => {
        for (const reset of [false, true]) {
          if (reset) response.resetMocked();
          expect(() => response.vary(field)).toThrow(new TypeError('field argument is required'));
          expect(response.get('Vary')).toBeUndefined();
        }
      },
    );

    test.each(['bad field', 'Accept,', ['Accept, Encoding'], ['Accept', 'bad field'], '\tAccept'])(
      'res.vary(%j) rejects invalid fields atomically like Express 5',
      (field) => {
        response.setHeader('Vary', 'Origin');
        expect(() => response.vary(field)).toThrow(
          new TypeError('field argument contains an invalid header name'),
        );
        expect(response.get('Vary')).toBe('Origin');
      },
    );

    test('res.vary appends arrays and comma lists case-insensitively and preserves wildcard after reset', () => {
      for (const reset of [false, true]) {
        if (reset) {
          response.vary.mockReturnValue(undefined);
          response.resetMocked();
        }
        expect(response.vary([])).toBe(response);
        expect(response.get('Vary')).toBeUndefined();
        response.setHeader('Vary', ['Origin', 'Accept']);
        expect(response.vary('accept, Accept-Encoding')).toBe(response);
        response.vary(['ACCEPT-ENCODING', 'X-Foo', 'x-foo']);
        expect(response.get('Vary')).toBe('Origin, Accept, Accept-Encoding, X-Foo');
        response.vary(['Accept', '*']);
        response.vary('Origin');
        expect(response.get('Vary')).toBe('*');
        expect(() => response.vary('bad field')).toThrow(TypeError);
      }
    });
  });

  describe('Response headers and content types', () => {
    test.each(['setHeader', 'set', 'header'])(
      'res.%s(name, value) stores lower-case keys and overwrites headers case-insensitively',
      (method) => {
        expect(response[method]('X-Custom', 'first')).toBe(response);
        response[method]('x-CUSTOM', 'second');

        expect(response.headers).toEqual({ 'x-custom': 'second' });
      },
    );

    test.each(['set', 'header'])(
      'res.%s(object) stores lower-case keys and overwrites headers case-insensitively',
      (method) => {
        response.setHeader('X-Custom', 'first');
        expect(response[method]({ 'x-CUSTOM': 'second', 'X-Other': 'other' })).toBe(response);

        expect(response.headers).toEqual({ 'x-custom': 'second', 'x-other': 'other' });
      },
    );

    test.each(['getHeader', 'get'])('res.%s(name) reads headers case-insensitively', (method) => {
      response.setHeader('X-Custom', 'value');

      expect(response[method]('x-custom')).toEqual('value');
      expect(response[method]('X-CUSTOM')).toEqual('value');
      expect(response[method]('missing')).toBeUndefined();
    });

    test('res.removeHeader(name) deletes headers case-insensitively and returns res', () => {
      response.setHeader('X-Custom', 'value');
      response.setHeader('X-Other', 'other');

      expect(response.removeHeader('x-CUSTOM')).toBe(response);
      expect(response.headers).toEqual({ 'x-other': 'other' });
      expect(response.getHeader('X-Custom')).toBeUndefined();
    });

    test.each([
      ['html', 'text/html; charset=utf-8'],
      ['json', 'application/json; charset=utf-8'],
      ['text', 'text/plain; charset=utf-8'],
      ['txt', 'text/plain; charset=utf-8'],
      ['xml', 'application/xml'],
      ['js', 'text/javascript; charset=utf-8'],
      ['css', 'text/css; charset=utf-8'],
      ['csv', 'text/csv; charset=utf-8'],
      ['png', 'image/png'],
      ['jpg', 'image/jpeg'],
      ['jpeg', 'image/jpeg'],
      ['gif', 'image/gif'],
      ['svg', 'image/svg+xml'],
      ['pdf', 'application/pdf'],
      ['nope', 'application/octet-stream'],
      ['text/plain', 'text/plain; charset=utf-8'],
      ['application/json', 'application/json; charset=utf-8'],
      ['image/png', 'image/png'],
      ['text/plain; charset=iso-8859-1', 'text/plain; charset=iso-8859-1'],
      ['application/json; Charset=UTF-16', 'application/json; Charset=UTF-16'],
    ])('res.type(%s) sets the Express 5 Content-Type before and after reset', (type, mimeType) => {
      for (const reset of [false, true]) {
        if (reset) response.resetMocked();
        expect(response.type(type)).toBe(response);
        expect(response.getHeader('content-type')).toEqual(mimeType);
        if (!type.includes('/')) {
          response.type(`.${type}`);
          expect(response.getHeader('content-type')).toEqual(mimeType);
        }
      }
    });

    test.each(['set', 'header'])(
      'res.%s adds a charset in both forms, preserves an explicit charset, and leaves setHeader raw',
      (method) => {
        for (const reset of [false, true]) {
          if (reset) response.resetMocked();
          for (const [value, expected] of [
            ['text/plain', 'text/plain; charset=utf-8'],
            ['application/json', 'application/json; charset=utf-8'],
            ['text/plain; format=flowed', 'text/plain; format=flowed; charset=utf-8'],
            ['text/plain; charset=iso-8859-1', 'text/plain; charset=iso-8859-1'],
            ['application/json; Charset=UTF-16', 'application/json; Charset=UTF-16'],
            ['application/xml', 'application/xml'],
            ['image/png', 'image/png'],
          ]) {
            expect(response[method]('cOnTeNt-TyPe', value)).toBe(response);
            expect(response.get('Content-Type')).toEqual(expected);
            expect(response[method]({ 'CONTENT-TYPE': value })).toBe(response);
            expect(response.get('Content-Type')).toEqual(expected);
            response.setHeader('Content-Type', value);
            expect(response.get('Content-Type')).toEqual(value);
          }
        }
      },
    );

    test('res.getHeader and res.get return undefined for never-set object property names after reset too', () => {
      for (const reset of [false, true]) {
        if (reset) response.resetMocked();
        for (const name of ['constructor', 'toString', '__proto__']) {
          expect(response.getHeader(name)).toBeUndefined();
          expect(response.get(name)).toBeUndefined();
        }
        expect(Object.getPrototypeOf(response.headers)).toBeNull();
      }
    });

    test('res.type(type) uses values containing a slash as-is', () => {
      response.type('application/custom; charset=iso-8859-1');

      expect(response.getHeader('Content-Type')).toEqual('application/custom; charset=iso-8859-1');
    });

    test('res.type(type) defaults unknown types to application/octet-stream', () => {
      response.type('unknown-extension');

      expect(response.getHeader('Content-Type')).toEqual('application/octet-stream');
    });

    test('res.location(path) sets Location and returns res', () => {
      expect(response.location('/destination')).toBe(response);
      expect(response.getHeader('Location')).toEqual('/destination');
      expect(response.headers).toEqual({ location: '/destination' });
    });

    test.each([
      ['json', { ok: true }, 'application/json; charset=utf-8'],
      ['jsonp', { ok: true }, 'application/json; charset=utf-8'],
      ['send', '<p>hello</p>', 'text/html; charset=utf-8'],
      ['send', Buffer.from('hello'), 'application/octet-stream'],
      ['send', { ok: true }, 'application/json; charset=utf-8'],
      ['send', ['hello'], 'application/json; charset=utf-8'],
      ['sendStatus', 404, 'text/plain; charset=utf-8'],
    ])('res.%s(%j) sets Content-Type from the body', (method, body, contentType) => {
      expect(response[method](body)).toBe(response);
      expect(response.getHeader('Content-Type')).toEqual(contentType);
      expect(response.body).toEqual(method === 'sendStatus' ? 'Not Found' : body);
    });

    test.each([
      ['json', { ok: true }],
      ['jsonp', { ok: true }],
      ['send', 'hello'],
      ['send', Buffer.from('hello')],
      ['send', { ok: true }],
      ['send', ['hello']],
      ['sendStatus', 404],
    ])('res.%s(%j) preserves an explicit Content-Type', (method, body) => {
      response.set('CoNtEnT-TyPe', 'text/custom');
      response[method](body);
      expect(response.getHeader('content-type')).toEqual('text/custom; charset=utf-8');

      response.resetMocked();
      response.type('application/custom');
      response[method](body);
      expect(response.getHeader('Content-Type')).toEqual('application/custom');
    });

    test('res.resetMocked() restores header and Content-Type behavior and clears headers', () => {
      response.set('X-Old', 'old');
      for (const method of [
        'setHeader',
        'set',
        'header',
        'get',
        'removeHeader',
        'type',
        'location',
      ]) {
        response[method].mockReturnValue(undefined);
      }
      response.resetMocked();

      expect(response.headers).toEqual({});
      response.header({ 'X-Custom': 'value' });
      expect(response.get('X-CUSTOM')).toEqual('value');
      expect(response.removeHeader('x-CUSTOM')).toBe(response);
      response.type('json');
      expect(response.get('CONTENT-TYPE')).toEqual('application/json; charset=utf-8');
      expect(response.location('/restored')).toBe(response);
      expect(response.get('LOCATION')).toEqual('/restored');

      for (const method of ['json', 'jsonp', 'send', 'sendStatus']) {
        response[method].mockReturnValue(undefined);
      }
      response.resetMocked();
      response.json({ ok: true });
      expect(response.get('CONTENT-TYPE')).toEqual('application/json; charset=utf-8');
      response.removeHeader('CONTENT-TYPE');
      response.jsonp({ ok: true });
      expect(response.get('CONTENT-TYPE')).toEqual('application/json; charset=utf-8');
      response.removeHeader('CONTENT-TYPE');
      response.send('hello');
      expect(response.get('CONTENT-TYPE')).toEqual('text/html; charset=utf-8');
      response.removeHeader('CONTENT-TYPE');
      response.sendStatus(404);
      expect(response.get('CONTENT-TYPE')).toEqual('text/plain; charset=utf-8');
    });
  });

  describe('Test headersSent', () => {
    test('headersSent should be false by default', () => {
      expect(response.headersSent).toEqual(false);
    });

    test('headersSent should allow you to update it', () => {
      response.setHeadersSent(true);
      expect(response.headersSent).toEqual(true);

      response.setHeadersSent(false);
      expect(response.headersSent).toEqual(false);
    });

    test('headersSent should be VALUE after reset', () => {
      response.setHeadersSent(true);
      response.resetMocked();

      expect(response.headersSent).toEqual(false);
    });
  });

  describe('Test locals', () => {
    test('locals should be empty by default', () => {
      expect(response.locals).toEqual({});
    });

    test('locals should allow you to update it', () => {
      const userValue = chance.string();
      const authenticatedValue = chance.bool();
      response.setLocals('user', userValue);
      expect(response.locals).toHaveProperty('user', userValue);

      response.setLocals('authenticated', authenticatedValue);
      expect(response.locals).toHaveProperty('user', userValue);
      expect(response.locals).toHaveProperty('authenticated', authenticatedValue);
    });

    test('locals should be empty after reset', () => {
      const userValue = chance.string();
      response.setLocals('user', userValue);
      response.resetMocked();

      expect(response.locals).toEqual({});
    });
  });

  describe('Test append', () => {
    test('append should have no calls by default', () => {
      expect(response.append).not.toHaveBeenCalled();
    });

    test('append should be called and match called with', () => {
      const value = chance.string();
      response.append(value);

      expect(response.append).toHaveBeenCalled();
      expect(response.append).toHaveBeenCalledWith(value);
    });

    test('append should have no call after reset', () => {
      const value = chance.string();
      response.append(value);

      response.resetMocked();
      expect(response.append).not.toHaveBeenCalled();
    });

    test('append returns response so is chainable', () => {
      const value = chance.string();
      expect(response.append(value)).toBe(response);
    });
  });

  describe('Test setHeader', () => {
    test('setHeader should have no calls by default', () => {
      expect(response.setHeader).not.toHaveBeenCalled();
    });

    test('setHeader should be called and match called with', () => {
      const key = chance.string();
      const value = chance.string();
      response.setHeader(key, value);

      expect(response.setHeader).toHaveBeenCalled();
      expect(response.setHeader).toHaveBeenCalledWith(key, value);
    });

    test('setHeader should have no call after reset', () => {
      const key = chance.string();
      const value = chance.string();
      response.setHeader(key, value);

      response.resetMocked();
      expect(response.setHeader).not.toHaveBeenCalled();
    });

    test('setHeader returns response so is chainable', () => {
      const key = chance.string();
      const value = chance.string();
      expect(response.setHeader(key, value)).toBe(response);
    });
  });

  describe('Test getHeader', () => {
    test('getHeader should return headers set by setHeader', () => {
      const key = chance.string();
      const value = chance.string();
      response.setHeader(key, value);

      expect(response.getHeader(key)).toEqual(value);
    });

    test('getHeader should return headers set by set', () => {
      const key = chance.string();
      const value = chance.string();
      response.set(key, value);

      expect(response.getHeader(key)).toEqual(value);
    });

    test('getHeader should return headers set by set with object', () => {
      const key = chance.string();
      const value = chance.string();
      response.set({ [key]: value });

      expect(response.getHeader(key)).toEqual(value);
    });

    test('getHeader should return headers set by header', () => {
      const key = chance.string();
      const value = chance.string();
      response.header(key, value);

      expect(response.getHeader(key)).toEqual(value);
    });

    test('getHeader should return headers set by header with object', () => {
      const key = chance.string();
      const value = chance.string();
      response.header({ [key]: value });

      expect(response.getHeader(key)).toEqual(value);
    });

    test('getHeader should return undefined after reset', () => {
      const key = chance.string();
      const value = chance.string();
      response.setHeader(key, value);

      response.resetMocked();
      expect(response.getHeader(key)).toEqual(undefined);
    });
  });

  describe('Test set', () => {
    test('set should have no calls by default', () => {
      expect(response.set).not.toHaveBeenCalled();
    });

    test('set should be called and match called with', () => {
      const key = chance.string();
      const value = chance.string();
      response.set(key, value);

      expect(response.set).toHaveBeenCalled();
      expect(response.set).toHaveBeenCalledWith(key, value);
    });

    test('set should call setHeader underneath', () => {
      const key = chance.string();
      const value = chance.string();
      response.set(key, value);

      expect(response.set).toHaveBeenCalled();
      expect(response.set).toHaveBeenCalledWith(key, value);
      expect(response.setHeader).toHaveBeenCalledWith(key, value);
    });

    test('set should account that internally it calls set recursively', () => {
      const key = chance.string();
      const value = chance.string();
      const key2 = chance.string();
      const value2 = chance.string();
      const input = { [key]: value, [key2]: value2 };
      response.set(input);
      expect(response.set).toHaveBeenCalled();
      expect(response.set).toHaveBeenCalledWith(input);
      expect(response.set).toHaveBeenCalledWith(key, value);
      expect(response.set).toHaveBeenCalledWith(key2, value2);
      expect(response.setHeader).toHaveBeenCalledWith(key, value);
      expect(response.setHeader).toHaveBeenCalledWith(key2, value2);
    });

    test('set should have no call after reset', () => {
      const key = chance.string();
      const value = chance.string();
      response.set(key, value);

      response.resetMocked();
      expect(response.set).not.toHaveBeenCalled();
      expect(response.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('Test header', () => {
    test('header should have no calls by default', () => {
      expect(response.header).not.toHaveBeenCalled();
    });

    test('header should be called and match called with', () => {
      const key = chance.string();
      const value = chance.string();
      response.header(key, value);

      expect(response.header).toHaveBeenCalled();
      expect(response.header).toHaveBeenCalledWith(key, value);
    });

    test('header should forward to set method', () => {
      const key = chance.string();
      const value = chance.string();
      response.header(key, value);

      expect(response.set).toHaveBeenCalled();
      expect(response.set).toHaveBeenCalledWith(key, value);
    });

    test('header should account that internally it calls set recursively', () => {
      const key = chance.string();
      const value = chance.string();
      const key2 = chance.string();
      const value2 = chance.string();
      const input = { [key]: value, [key2]: value2 };
      response.header(input);
      expect(response.header).toHaveBeenCalled();
      expect(response.header).toHaveBeenCalledWith(input);
      expect(response.set).toHaveBeenCalled();
      expect(response.set).toHaveBeenCalledWith(input);
      expect(response.set).toHaveBeenCalledWith(key, value);
      expect(response.set).toHaveBeenCalledWith(key2, value2);
      expect(response.setHeader).toHaveBeenCalledWith(key, value);
      expect(response.setHeader).toHaveBeenCalledWith(key2, value2);
    });

    test('set should have no call after reset', () => {
      const key = chance.string();
      const value = chance.string();
      response.header(key, value);

      response.resetMocked();
      expect(response.header).not.toHaveBeenCalled();
      expect(response.set).not.toHaveBeenCalled();
      expect(response.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('Test attachment', () => {
    test('attachment should have no calls by default', () => {
      expect(response.attachment).not.toHaveBeenCalled();
    });

    test('attachment should be called and match called with', () => {
      const value = chance.string();
      response.attachment(value);

      expect(response.attachment).toHaveBeenCalled();
      expect(response.attachment).toHaveBeenCalledWith(value);
    });

    test('attachment should have no call after reset', () => {
      const value = chance.string();
      response.attachment(value);

      response.resetMocked();
      expect(response.attachment).not.toHaveBeenCalled();
    });

    test('attachment returns response so is chainable', () => {
      const value = chance.string();
      expect(response.attachment(value)).toBe(response);
    });
  });

  describe('Test cookie', () => {
    test('cookie should have no calls by default', () => {
      expect(response.cookie).not.toHaveBeenCalled();
    });

    test('cookie should be called and match called with', () => {
      const value = chance.string();
      response.cookie(value);

      expect(response.cookie).toHaveBeenCalled();
      expect(response.cookie).toHaveBeenCalledWith(value);
    });

    test('cookie should have no call after reset', () => {
      const value = chance.string();
      response.cookie(value);

      response.resetMocked();
      expect(response.cookie).not.toHaveBeenCalled();
    });

    test('cookie returns response so is chainable', () => {
      const value = chance.string();
      expect(response.cookie(value)).toBe(response);
    });
  });

  describe('Test clearCookie', () => {
    test('clearCookie should have no calls by default', () => {
      expect(response.clearCookie).not.toHaveBeenCalled();
    });

    test('clearCookie should be called and match called with', () => {
      const value = chance.string();
      response.clearCookie(value);

      expect(response.clearCookie).toHaveBeenCalled();
      expect(response.clearCookie).toHaveBeenCalledWith(value);
    });

    test('clearCookie should have no call after reset', () => {
      const value = chance.string();
      response.clearCookie(value);

      response.resetMocked();
      expect(response.clearCookie).not.toHaveBeenCalled();
    });

    test('clearCookie returns response so is chainable', () => {
      const value = chance.string();
      expect(response.clearCookie(value)).toBe(response);
    });
  });

  describe('Test download', () => {
    test('download should have no calls by default', () => {
      expect(response.download).not.toHaveBeenCalled();
    });

    test('download should be called and match called with', () => {
      const value = chance.string();
      response.download(value);

      expect(response.download).toHaveBeenCalled();
      expect(response.download).toHaveBeenCalledWith(value);
    });

    test('download should have no call after reset', () => {
      const value = chance.string();
      response.download(value);

      response.resetMocked();
      expect(response.download).not.toHaveBeenCalled();
    });
  });

  describe('Test end', () => {
    test.each(['finished', '', Buffer.from('finished')])(
      'res.end(%j) sets body and returns res',
      (data) => {
        expect(response.end(data)).toBe(response);
        expect(response.body).toEqual(data);
      },
    );

    test('res.end() preserves the existing body and returns res', () => {
      response.body = 'existing body';

      const result = response.end();

      expect(response.body).toEqual('existing body');
      expect(result).toBe(response);
    });

    test('res.end(data) restores its default implementation after resetMocked()', () => {
      response.end.mockReturnValue(undefined);
      response.resetMocked();

      expect(response.end('finished')).toBe(response);
      expect(response.body).toEqual('finished');
      expect(response.end()).toBe(response);
      expect(response.body).toEqual('finished');
    });

    test('end should have no calls by default', () => {
      expect(response.end).not.toHaveBeenCalled();
    });

    test('end should be called and match called with', () => {
      const value = chance.string();
      response.end(value);

      expect(response.end).toHaveBeenCalled();
      expect(response.end).toHaveBeenCalledWith(value);
      expect(response.body).toEqual(value);
    });

    test('end should have no call after reset', () => {
      const value = chance.string();
      response.end(value);

      response.resetMocked();
      expect(response.end).not.toHaveBeenCalled();
    });
  });

  describe('Test format', () => {
    test('format should have no calls by default', () => {
      expect(response.format).not.toHaveBeenCalled();
    });

    test('format should be called and match called with', () => {
      const value = chance.string();
      response.format(value);

      expect(response.format).toHaveBeenCalled();
      expect(response.format).toHaveBeenCalledWith(value);
    });

    test('format should have no call after reset', () => {
      const value = chance.string();
      response.format(value);

      response.resetMocked();
      expect(response.format).not.toHaveBeenCalled();
    });

    test('format returns response so is chainable', () => {
      const value = chance.string();
      expect(response.format(value)).toBe(response);
    });
  });

  describe('Test get', () => {
    test('get should have no calls by default', () => {
      expect(response.get).not.toHaveBeenCalled();
    });

    test('get should be called and match called with', () => {
      const value = chance.string();
      response.get(value);

      expect(response.get).toHaveBeenCalled();
      expect(response.get).toHaveBeenCalledWith(value);
    });

    test('get should have no call after reset', () => {
      const value = chance.string();
      response.get(value);

      response.resetMocked();
      expect(response.get).not.toHaveBeenCalled();
    });
  });

  describe('Test json', () => {
    test('json should have no calls by default', () => {
      expect(response.json).not.toHaveBeenCalled();
    });

    test('json should be called and match called with', () => {
      const value = chance.string();
      response.json(value);

      expect(response.json).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith(value);
      expect(response.body).toEqual(value);
    });

    test('json should have no call after reset', () => {
      const value = chance.string();
      response.json(value);

      response.resetMocked();
      expect(response.json).not.toHaveBeenCalled();
    });
  });

  describe('Test jsonp', () => {
    test('jsonp should have no calls by default', () => {
      expect(response.jsonp).not.toHaveBeenCalled();
    });

    test('jsonp should be called and match called with', () => {
      const value = chance.string();
      response.jsonp(value);

      expect(response.jsonp).toHaveBeenCalled();
      expect(response.jsonp).toHaveBeenCalledWith(value);
      expect(response.body).toEqual(value);
    });

    test('jsonp should have no call after reset', () => {
      const value = chance.string();
      response.jsonp(value);

      response.resetMocked();
      expect(response.jsonp).not.toHaveBeenCalled();
    });
  });

  describe('Test links', () => {
    test('links should have no calls by default', () => {
      expect(response.links).not.toHaveBeenCalled();
    });

    test('links should be called and match called with', () => {
      const value = chance.string();
      response.links(value);

      expect(response.links).toHaveBeenCalled();
      expect(response.links).toHaveBeenCalledWith(value);
    });

    test('links should have no call after reset', () => {
      const value = chance.string();
      response.links(value);

      response.resetMocked();
      expect(response.links).not.toHaveBeenCalled();
    });

    test('links returns response so is chainable', () => {
      const value = chance.string();
      expect(response.links(value)).toBe(response);
    });
  });

  describe('Test links header (Express 5)', () => {
    test('res.links sets the Link header for a single rel', () => {
      response.links({ next: 'http://api.example.com/users?page=2' });

      expect(response.get('Link')).toBe('<http://api.example.com/users?page=2>; rel="next"');
    });

    test('res.links joins multiple rels with ", " like Express', () => {
      response.links({ next: 'http://a.example.com', last: 'http://b.example.com' });

      expect(response.get('Link')).toBe(
        '<http://a.example.com>; rel="next", <http://b.example.com>; rel="last"',
      );
    });

    test('res.links supports a repeated rel given as an array', () => {
      response.links({ item: ['http://a.example.com/1', 'http://a.example.com/2'] });

      expect(response.get('Link')).toBe(
        '<http://a.example.com/1>; rel="item", <http://a.example.com/2>; rel="item"',
      );
    });

    test('res.links appends to an existing Link header', () => {
      response.set('Link', '<http://old.example.com>; rel="prev"');
      response.links({ next: 'http://new.example.com' });

      expect(response.get('Link')).toBe(
        '<http://old.example.com>; rel="prev", <http://new.example.com>; rel="next"',
      );
    });

    test('res.links returns res and stores the header lower-case', () => {
      const result = response.links({ next: 'http://a.example.com' });

      expect(result).toBe(response);
      expect(response.headers.link).toBe('<http://a.example.com>; rel="next"');
    });
  });

  describe('Test location', () => {
    test('location should have no calls by default', () => {
      expect(response.location).not.toHaveBeenCalled();
    });

    test('location should be called and match called with', () => {
      const value = chance.string();
      response.location(value);

      expect(response.location).toHaveBeenCalled();
      expect(response.location).toHaveBeenCalledWith(value);
    });

    test('location should have no call after reset', () => {
      const value = chance.string();
      response.location(value);

      response.resetMocked();
      expect(response.location).not.toHaveBeenCalled();
    });

    test('location returns response so is chainable', () => {
      const value = chance.string();
      expect(response.location(value)).toBe(response);
    });
  });

  describe('Test redirect', () => {
    test('res.redirect(url) defaults to 302', () => {
      response.statusCode = 301;
      response.redirect('/destination');

      expect(response.statusCode).toEqual(302);
      expect(response.setHeader).toHaveBeenCalledWith('Location', '/destination');
      expect(response.getHeader('Location')).toEqual('/destination');
    });

    test('res.redirect(url) restores its default implementation after resetMocked()', () => {
      response.redirect.mockReturnValue(undefined);
      response.resetMocked();
      response.redirect('/destination');

      expect(response.statusCode).toEqual(302);
      expect(response.getHeader('Location')).toEqual('/destination');

      response.redirect(301, '/moved');

      expect(response.statusCode).toEqual(301);
      expect(response.getHeader('Location')).toEqual('/moved');
    });

    test('redirect should have no calls by default', () => {
      expect(response.redirect).not.toHaveBeenCalled();
    });

    test('redirect should be called and match called with', () => {
      const value = chance.string();
      response.redirect(value);

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(value);
      expect(response.getHeader('Location')).toEqual(value);
    });

    test('redirect should be called and match called with status and url', () => {
      const value = chance.string();
      const statusCode = 307;
      response.redirect(statusCode, value);

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(statusCode, value);
      expect(response.statusCode).toEqual(307);
      expect(response.getHeader('Location')).toEqual(value);
    });

    test('redirect should have no call after reset', () => {
      const value = chance.string();
      response.redirect(value);

      response.resetMocked();
      expect(response.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Test render', () => {
    test('render should have no calls by default', () => {
      expect(response.render).not.toHaveBeenCalled();
    });

    test('render should be called and match called with', () => {
      const value = chance.string();
      response.render(value);

      expect(response.render).toHaveBeenCalled();
      expect(response.render).toHaveBeenCalledWith(value);
    });

    test('render should have no call after reset', () => {
      const value = chance.string();
      response.render(value);

      response.resetMocked();
      expect(response.render).not.toHaveBeenCalled();
    });
  });

  describe('Test send', () => {
    test('send should have no calls by default', () => {
      expect(response.send).not.toHaveBeenCalled();
      expect(response.body).toEqual({});
    });

    test('send should be called and match called with', () => {
      const value = chance.string();
      response.send(value);

      expect(response.send).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(value);
      expect(response.body).toEqual(value);
    });

    test('send should have no call after reset', () => {
      const value = chance.string();
      response.send(value);

      response.resetMocked();
      expect(response.send).not.toHaveBeenCalled();
      expect(response.body).toEqual({});
    });

    test('send returns response so is chainable', () => {
      const value = chance.string();
      const res = response.send(value);
      expect(res).toBe(response);
      expect(res.body).toEqual(value);
    });
  });

  describe('Test sendFile', () => {
    test('sendFile should have no calls by default', () => {
      expect(response.sendFile).not.toHaveBeenCalled();
    });

    test('sendFile should be called and match called with', () => {
      const value = chance.string();
      response.sendFile(value);

      expect(response.sendFile).toHaveBeenCalled();
      expect(response.sendFile).toHaveBeenCalledWith(value);
    });

    test('sendFile should have no call after reset', () => {
      const value = chance.string();
      response.sendFile(value);

      response.resetMocked();
      expect(response.sendFile).not.toHaveBeenCalled();
    });
  });

  describe('Test sendStatus', () => {
    test.each([
      [200, 'OK'],
      [404, 'Not Found'],
      [500, 'Internal Server Error'],
      [599, '599'],
    ])('res.sendStatus(%i) sets statusCode and body to %s and returns res', (code, body) => {
      const result = response.sendStatus(code);

      expect(response.statusCode).toEqual(code);
      expect(response.body).toEqual(body);
      expect(result).toBe(response);
    });

    test('res.sendStatus(code) restores its default implementation after resetMocked()', () => {
      response.sendStatus.mockReturnValue(undefined);
      response.resetMocked();

      expect(response.sendStatus(404)).toBe(response);
      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual('Not Found');
    });

    test('sendStatus should have no calls by default', () => {
      expect(response.sendStatus).not.toHaveBeenCalled();
    });

    test('sendStatus should be called and match called with', () => {
      const value = 404;
      response.sendStatus(value);

      expect(response.sendStatus).toHaveBeenCalled();
      expect(response.sendStatus).toHaveBeenCalledWith(value);
    });

    test('sendStatus should have no call after reset', () => {
      const value = 404;
      response.sendStatus(value);

      response.resetMocked();
      expect(response.sendStatus).not.toHaveBeenCalled();
      expect(response.body).toEqual({});
    });
  });

  describe('Test set', () => {
    test('set should have no calls by default', () => {
      expect(response.set).not.toHaveBeenCalled();
    });

    test('set should be called and match called with', () => {
      const value = chance.string();
      response.set(value);

      expect(response.set).toHaveBeenCalled();
      expect(response.set).toHaveBeenCalledWith(value);
    });

    test('set should have no call after reset', () => {
      const value = chance.string();
      response.set(value);

      response.resetMocked();
      expect(response.set).not.toHaveBeenCalled();
    });

    test('set returns response so is chainable', () => {
      const key = chance.string();
      const value = chance.string();
      expect(response.set(key, value)).toBe(response);
    });
  });

  describe('Test status', () => {
    test('res.resetMocked() restores statusCode to 200', () => {
      response.status(404);
      response.sendStatus(500);
      response.redirect('/elsewhere');

      response.resetMocked();

      expect(response.statusCode).toEqual(200);
    });

    test('status should have no calls by default', () => {
      expect(response.status).not.toHaveBeenCalled();
    });

    test('status should be called and match called with, end should be callable', () => {
      const code = chance.natural({ min: 100, max: 999 });

      response.status(code).end();

      expect(response.status).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(code);
      expect(response.end).toHaveBeenCalled();
      expect(response.body).toEqual({});
    });

    test('that when status is called it sets the statusCode property', () => {
      const code = chance.natural({ min: 100, max: 999 });

      response.status(code);

      expect(response.statusCode).toEqual(code);
    });

    test('status should be called and match called with, send should be callable', () => {
      const code = chance.natural({ min: 100, max: 999 });
      const value = chance.string();

      response.status(code).send(value);

      expect(response.status).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(code);
      expect(response.send).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(value);
      expect(response.body).toEqual(value);
    });

    test('status should be called and match called with, sendFile should be callable', () => {
      const code = chance.natural({ min: 100, max: 999 });
      const value = chance.string();

      response.status(code).sendFile(value);

      expect(response.status).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(code);
      expect(response.sendFile).toHaveBeenCalled();
      expect(response.sendFile).toHaveBeenCalledWith(value);
    });

    test('status should have no call after reset', () => {
      const value = 404;
      response.status(value);

      response.resetMocked();
      expect(response.status).not.toHaveBeenCalled();
    });

    test('status returns response so is chainable', () => {
      const code = chance.natural({ min: 100, max: 999 });
      expect(response.status(code)).toBe(response);
    });
  });

  describe('Test type', () => {
    test('type should have no calls by default', () => {
      expect(response.type).not.toHaveBeenCalled();
    });

    test('type should be called and match called with', () => {
      const value = chance.string();
      response.type(value);

      expect(response.type).toHaveBeenCalled();
      expect(response.type).toHaveBeenCalledWith(value);
    });

    test('type should have no call after reset', () => {
      const value = chance.string();
      response.type(value);

      response.resetMocked();
      expect(response.type).not.toHaveBeenCalled();
    });

    test('type returns response so is chainable', () => {
      const value = chance.string();
      expect(response.type(value)).toBe(response);
    });
  });

  describe('Test text', () => {
    test('text should have no calls by default', () => {
      expect(response.text).not.toHaveBeenCalled();
    });

    test('text should be called and match called with', () => {
      const value = chance.string();
      response.text(value);

      expect(response.text).toHaveBeenCalled();
      expect(response.text).toHaveBeenCalledWith(value);
      expect(response.body).toEqual(value);
    });

    test('text should have no call after reset', () => {
      const value = chance.string();
      response.text(value);

      response.resetMocked();
      expect(response.text).not.toHaveBeenCalled();
      expect(response.body).toEqual({});
    });

    test('text returns response so is chainable', () => {
      const value = chance.string();
      expect(response.text(value)).toBe(response);
    });
  });

  describe('Test vary', () => {
    test('vary should have no calls by default', () => {
      expect(response.vary).not.toHaveBeenCalled();
    });

    test('vary should be called and match called with', () => {
      const value = 'Accept';
      response.vary(value);

      expect(response.vary).toHaveBeenCalled();
      expect(response.vary).toHaveBeenCalledWith(value);
    });

    test('vary should have no call after reset', () => {
      const value = 'Accept';
      response.vary(value);

      response.resetMocked();
      expect(response.vary).not.toHaveBeenCalled();
    });

    test('vary returns response so is chainable', () => {
      const value = 'Accept';
      expect(response.vary(value)).toBe(response);
    });
  });

  describe('Test removeHeader', () => {
    test('removeHeader should have no calls by default', () => {
      expect(response.removeHeader).not.toHaveBeenCalled();
    });

    test('removeHeader should be called and match called with', () => {
      const value = chance.string();
      response.removeHeader(value);

      expect(response.removeHeader).toHaveBeenCalled();
      expect(response.removeHeader).toHaveBeenCalledWith(value);
    });

    test('removeHeader should have no call after reset', () => {
      const value = chance.string();
      response.removeHeader(value);

      response.resetMocked();
      expect(response.removeHeader).not.toHaveBeenCalled();
    });

    test('removeHeader returns response so is chainable', () => {
      const value = chance.string();
      expect(response.removeHeader(value)).toBe(response);
    });
  });
});
