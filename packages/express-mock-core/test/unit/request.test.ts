import Chance from 'chance';
import { afterEach, beforeEach, describe, expect, it, test } from 'vitest';

import { Express } from '../../src/express';
import { Request } from '../../src/request';

const chance = new Chance();
let request: Request;

describe('Express Request', () => {
  beforeEach(() => {
    request = new Request();
  });

  afterEach(() => {
    request.resetMocked();
  });

  test('removed request methods stay absent in Express 5', () => {
    for (const key of ['param', 'acceptsCharset', 'acceptsEncoding', 'acceptsLanguage']) {
      expect(key in request).toBe(false);
    }
  });

  test('req.query is a getter-only snapshot with setQuery and setUrl helpers after reset', () => {
    for (const reset of [false, true]) {
      if (reset) request.resetMocked();
      request.setUrl('/?id=1');
      const descriptor = Object.getOwnPropertyDescriptor(Request.prototype, 'query');
      expect(descriptor?.get).toBeTypeOf('function');
      expect(descriptor?.set).toBeUndefined();
      expect(() => {
        request.query = { replaced: 'yes' };
      }).toThrow(TypeError);
      expect(Reflect.set(request, 'query', {})).toBe(false);
      request.query.id = 'changed';
      expect(request.query).toEqual({ id: '1' });
      request.setQuery('extra', 'yes');
      request.setQuery({ other: 'value' });
      expect(request.query).toEqual({ id: '1', extra: 'yes', other: 'value' });
      expect(Object.getPrototypeOf(request.query)).toBeNull();
      request.setUrl('/?new=2');
      expect(request.query).toEqual({ new: '2' });
    }
    request.resetMocked();
    expect(request.query).toEqual({});
  });

  test('req.query returns fresh arrays and reset restores the constructor URL', () => {
    const req = new Request('/?id=1&id=2');
    req.query.id.push('3');
    expect(req.query).toEqual({ id: ['1', '2'] });
    req.setQuery('extra', 'value');
    req.setUrl('/?changed=yes');
    req.resetMocked();
    expect(req.query).toEqual({ id: ['1', '2'] });
  });

  test('req.params has a null prototype in the constructor, setParams and reset like Express 5', () => {
    for (const reset of [false, true]) {
      if (reset) request.resetMocked();
      expect(Object.getPrototypeOf(request.params)).toBeNull();
      request.setParams('__proto__', 'literal');
      request.setParams({ constructor: 'literal', id: '1' });
      expect(Object.getPrototypeOf(request.params)).toBeNull();
      expect(Object.getOwnPropertyDescriptor(request.params, '__proto__')?.value).toBe('literal');
      expect(request.params.constructor).toBe('literal');
      expect(request.params.id).toBe('1');
    }
  });

  describe('Accept header negotiation', () => {
    test.each([
      ['accepts', 'Accept', 'text/html;bad', ['html'], 'html'],
      ['accepts', 'Accept', 'text/html;q', ['html'], 'html'],
      ['accepts', 'Accept', ';;;', ['html'], false],
      ['acceptsCharsets', 'Accept-Charset', 'utf-8;bad', ['utf-8'], 'utf-8'],
      [
        'acceptsEncodings',
        'Accept-Encoding',
        'gzip, deflate;bad',
        [],
        ['gzip', 'deflate', 'identity'],
      ],
      ['acceptsLanguages', 'Accept-Language', 'en-US;bad', ['en'], 'en'],
    ])(
      'req.%s ignores a malformed %s parameter (%j) like negotiator',
      (method, header, value, args, expected) => {
        request.setHeaders(header, value);
        expect(request[method](...args)).toEqual(expected);
      },
    );

    test("req.accepts('json') matches application/json in the Accept header", () => {
      request.setHeaders('Accept', 'application/json');
      expect(request.accepts('json')).toEqual('json');
    });

    test('req.accepts returns false when no media type matches', () => {
      request.setHeaders('Accept', 'text/html');
      expect(request.accepts('application/json')).toEqual(false);
    });

    test('req.accepts chooses the highest quality from several arguments', () => {
      request.setHeaders('Accept', 'text/*;q=.5, application/json');
      expect(request.accepts('html', 'json')).toEqual('json');
    });

    test('req.accepts chooses the highest quality from an array', () => {
      request.setHeaders('Accept', 'text/*;q=.5, application/json');
      expect(request.accepts(['html', 'json'])).toEqual('json');
    });

    test('req.accepts uses caller order for equally specific wildcard matches', () => {
      request.setHeaders('Accept', '*/*');
      expect(request.accepts(['text', 'json'])).toEqual('text');
    });

    test('req.accepts matches a media type wildcard', () => {
      request.setHeaders('Accept', 'text/*');
      expect(request.accepts('html', 'text')).toEqual('html');
    });

    test('req.accepts excludes q=0 even when a wildcard allows the type', () => {
      request.setHeaders('Accept', '*/*;q=1, application/json;q=0');
      expect(request.accepts('json', 'html')).toEqual('html');
    });

    test('req.accepts applies a specific quality before a wildcard quality', () => {
      request.setHeaders('Accept', 'text/*;q=1, text/html;q=.1, application/json;q=.5');
      expect(request.accepts('html', 'json')).toEqual('json');
    });

    test('req.accepts uses header order for equally ranked explicit matches', () => {
      request.setHeaders('Accept', 'text/html, application/json');
      expect(request.accepts('json', 'html')).toEqual('html');
    });

    test('req.accepts returns the first supplied type without an Accept header', () => {
      expect(request.accepts('unknown', 'json')).toEqual('unknown');
    });

    test('req.accepts lists the wildcard without an Accept header', () => {
      expect(request.accepts()).toEqual(['*/*']);
    });

    test('req.accepts returns the first supplied type with an empty Accept header', () => {
      request.setHeaders('Accept', '');
      expect(request.accepts('json')).toEqual('json');
    });

    test('req.accepts lists media types in preference order without q=0 entries', () => {
      request.setHeaders('Accept', 'application/json;q=.8, text/html, image/png;q=0');
      expect(request.accepts()).toEqual(['text/html', 'application/json']);
    });

    test('req.accepts matches media type parameters', () => {
      request.setHeaders('Accept', 'text/html;level=1;q=.8, text/html;q=.5');
      expect(request.accepts('text/html;level=1', 'text/html')).toEqual('text/html;level=1');
    });

    test('req.accepts keeps quoted commas and semicolons inside parameters', () => {
      request.setHeaders('Accept', 'text/html;profile="a,b;c"');
      expect(request.accepts('text/html;profile="a,b;c"')).toEqual('text/html;profile="a,b;c"');
    });

    test("req.accepts matches case-insensitively and preserves the caller's spelling", () => {
      request.setHeaders('Accept', 'APPLICATION/JSON');
      expect(request.accepts('JSON')).toEqual('JSON');
    });

    test('req.accepts skips unknown extensions and matches dotted extensions', () => {
      request.setHeaders('Accept', 'image/png');
      expect(request.accepts('unknown', '.png')).toEqual('.png');
    });

    test('req.acceptsCharsets lists the wildcard without a header', () => {
      expect(request.acceptsCharsets()).toEqual(['*']);
    });

    test('req.acceptsCharsets returns the first supplied charset without a header', () => {
      expect(request.acceptsCharsets('utf-8', 'ascii')).toEqual('utf-8');
    });

    test('req.acceptsCharsets chooses the highest quality from an array', () => {
      request.setHeaders('Accept-Charset', 'utf-8;q=.8, iso-8859-1');
      expect(request.acceptsCharsets(['utf-8', 'iso-8859-1'])).toEqual('iso-8859-1');
    });

    test('req.acceptsCharsets excludes q=0 even when a wildcard allows the charset', () => {
      request.setHeaders('Accept-Charset', '*;q=.5, utf-8;q=0');
      expect(request.acceptsCharsets('utf-8', 'ascii')).toEqual('ascii');
    });

    test('req.acceptsCharsets matches case-insensitively', () => {
      request.setHeaders('Accept-Charset', 'UTF-8');
      expect(request.acceptsCharsets('utf-8')).toEqual('utf-8');
    });

    test('req.acceptsCharsets returns false when nothing matches', () => {
      request.setHeaders('Accept-Charset', 'utf-8');
      expect(request.acceptsCharsets('ascii')).toEqual(false);
    });

    test('req.acceptsCharsets lists charsets in preference order without q=0 entries', () => {
      request.setHeaders('Accept-Charset', 'utf-8;q=0, ascii;q=.5, iso-8859-1');
      expect(request.acceptsCharsets()).toEqual(['iso-8859-1', 'ascii']);
    });

    test('req.acceptsEncodings lists identity without a header', () => {
      expect(request.acceptsEncodings()).toEqual(['identity']);
    });

    test('req.acceptsEncodings rejects compression without a header', () => {
      expect(request.acceptsEncodings('gzip')).toEqual(false);
    });

    test('req.acceptsEncodings accepts identity without a header', () => {
      expect(request.acceptsEncodings('gzip', 'identity')).toEqual('identity');
    });

    test('req.acceptsEncodings adds identity at the lowest positive quality', () => {
      request.setHeaders('Accept-Encoding', 'gzip;q=.5, br');
      expect(request.acceptsEncodings()).toEqual(['br', 'gzip', 'identity']);
    });

    test('req.acceptsEncodings allows identity when compression has q=0', () => {
      request.setHeaders('Accept-Encoding', 'gzip;q=0');
      expect(request.acceptsEncodings()).toEqual(['identity']);
    });

    test('req.acceptsEncodings excludes identity with a zero-quality wildcard', () => {
      request.setHeaders('Accept-Encoding', '*;q=0');
      expect(request.acceptsEncodings(['gzip', 'identity'])).toEqual(false);
    });

    test('req.acceptsEncodings respects an explicit identity exclusion', () => {
      request.setHeaders('Accept-Encoding', 'gzip, identity;q=0');
      expect(request.acceptsEncodings('identity', 'gzip')).toEqual('gzip');
    });

    test('req.acceptsEncodings applies explicit exclusions before wildcards', () => {
      request.setHeaders('Accept-Encoding', '*;q=.5, gzip;q=0');
      expect(request.acceptsEncodings('gzip', 'br')).toEqual('br');
    });

    test('req.acceptsEncodings matches case-insensitively', () => {
      request.setHeaders('Accept-Encoding', 'GZIP');
      expect(request.acceptsEncodings('gzip')).toEqual('gzip');
    });

    test('req.acceptsEncodings uses header order for equally ranked matches', () => {
      request.setHeaders('Accept-Encoding', 'gzip, br');
      expect(request.acceptsEncodings('br', 'gzip')).toEqual('gzip');
    });

    test('req.acceptsLanguages lists the wildcard without a header', () => {
      expect(request.acceptsLanguages()).toEqual(['*']);
    });

    test('req.acceptsLanguages returns the first supplied language without a header', () => {
      expect(request.acceptsLanguages('en', 'fr')).toEqual('en');
    });

    test('req.acceptsLanguages matches a general language against a regional header', () => {
      request.setHeaders('Accept-Language', 'en-US');
      expect(request.acceptsLanguages('en')).toEqual('en');
    });

    test('req.acceptsLanguages matches a regional language against a general header', () => {
      request.setHeaders('Accept-Language', 'en');
      expect(request.acceptsLanguages('en-US')).toEqual('en-US');
    });

    test('req.acceptsLanguages rejects different regions without a general range', () => {
      request.setHeaders('Accept-Language', 'en-US');
      expect(request.acceptsLanguages('en-GB')).toEqual(false);
    });

    test('req.acceptsLanguages chooses the highest quality from an array', () => {
      request.setHeaders('Accept-Language', 'en-US;q=.5, en;q=.8, fr');
      expect(request.acceptsLanguages(['en', 'fr'])).toEqual('fr');
    });

    test('req.acceptsLanguages applies explicit exclusions before wildcards', () => {
      request.setHeaders('Accept-Language', '*;q=.5, en;q=0');
      expect(request.acceptsLanguages('en', 'fr')).toEqual('fr');
    });

    test('req.acceptsLanguages lists languages in preference order without q=0 entries', () => {
      request.setHeaders('Accept-Language', 'en;q=.8, es, pt;q=0');
      expect(request.acceptsLanguages()).toEqual(['es', 'en']);
    });

    test('req.acceptsLanguages matches case-insensitively and preserves caller casing', () => {
      request.setHeaders('Accept-Language', 'EN-us');
      expect(request.acceptsLanguages('en-US')).toEqual('en-US');
    });

    test('req.acceptsLanguages prefers an exact match over a prefix match', () => {
      request.setHeaders('Accept-Language', 'en-US, en');
      expect(request.acceptsLanguages('en', 'en-US')).toEqual('en-US');
    });

    test('req.accepts* restores negotiation defaults and initial headers after resetMocked()', () => {
      request = new Request('/users?id=1&id=2', {
        headers: {
          Accept: 'application/json',
          'Accept-Charset': 'utf-8',
          'Accept-Encoding': 'gzip',
          'Accept-Language': 'en-US',
        },
      });
      for (const method of ['accepts', 'acceptsCharsets', 'acceptsEncodings', 'acceptsLanguages']) {
        request[method].mockReturnValue(false);
        request[method]('anything');
      }
      request.setHeaders('Accept', 'text/html');
      request.resetMocked();
      for (const method of ['accepts', 'acceptsCharsets', 'acceptsEncodings', 'acceptsLanguages']) {
        expect(request[method]).not.toHaveBeenCalled();
      }
      expect(request.accepts('json')).toBe('json');
      expect(request.acceptsCharsets('utf-8')).toBe('utf-8');
      expect(request.acceptsEncodings('gzip')).toBe('gzip');
      expect(request.acceptsLanguages('en')).toBe('en');
      expect(request.query).toEqual({ id: ['1', '2'] });
    });
  });

  describe('URL parsing', () => {
    test('setUrl keeps relative dot segments like Express and uses simple query parser semantics', () => {
      request.setUrl('/users/../search?id=1&id=2&name=a+b&literal=%2B&empty=&flag&bad=%ZZ#top');
      expect(request.path).toBe('/users/../search');
      expect(request.originalUrl).toBe(
        '/users/../search?id=1&id=2&name=a+b&literal=%2B&empty=&flag&bad=%ZZ',
      );
      expect(request.hostname).toBeUndefined();
      expect(request.protocol).toBe('http');
      expect(request.secure).toBe(false);
      expect(request.query).toEqual({
        id: ['1', '2'],
        name: 'a b',
        literal: '+',
        empty: '',
        flag: '',
        bad: '%ZZ',
      });
      expect(Object.getPrototypeOf(request.query)).toBeNull();
    });

    test('setUrl keeps the raw path of absolute URLs and sets hostname, protocol, secure and subdomains', () => {
      request.setUrl('https://www.example.com:3000/a/../café?q=1&q=2');
      expect(request.path).toBe('/a/../café');
      expect(request.originalUrl).toBe('/a/../café?q=1&q=2');
      expect(request.hostname).toBe('www.example.com');
      expect(request.protocol).toBe('https');
      expect(request.secure).toBe(true);
      expect(request.subdomains).toEqual(['www']);
      expect(request.query).toEqual({ q: ['1', '2'] });
    });

    test('setUrl recomputes subdomains from the new hostname on every call', () => {
      request.setUrl('https://www.example.com/');
      expect(request.subdomains).toEqual(['www']);

      request.setUrl('https://example.com/');
      expect(request.subdomains).toEqual([]);

      request.setUrl('https://www.example.com/');
      request.setUrl('/relative');
      expect(request.subdomains).toEqual(['www']);
    });

    // Expected values come from Express 5.3.0's parseurl.
    test.each([
      ['/a/./b', '/a/./b', ''],
      ['/%2e%2e/x', '/%2e%2e/x', ''],
      ['/caf\u00e9?x=1', '/caf\u00e9', '?x=1'],
      ['users', 'users', ''],
      ['/a b?c d', '/a%20b', '?c%20d'],
      ['/a"b', '/a"b', ''],
      ['/a"b c', '/a%22b%20c', ''],
      ['\\x', '/x', ''],
      ['/x#frag', '/x', ''],
      ['/a@b c', '/a@b%20c', ''],
      ['http://h.example.com/a\\b?c\\d', '/a/b', '?c%5Cd'],
    ])('setUrl(%j) gives path %j and search %j like Express', (url, path, search) => {
      request.setUrl(url);
      expect(request.path).toBe(path);
      expect(request.originalUrl).toBe(path + search);
    });
  });

  describe('Test constructor', () => {
    test('request should parse full url with query', () => {
      request = new Request('https://www.example.com:3000/some/path?foo=bar&fiz=fuz');
      expect(request.originalUrl).toEqual('/some/path?foo=bar&fiz=fuz');
      expect(request.path).toEqual('/some/path');
      expect(request.baseUrl).toEqual('');
      expect(request.method).toEqual('GET');
      expect(request.hostname).toEqual('www.example.com');
      expect(request.query).toEqual({ fiz: 'fuz', foo: 'bar' });
      expect(request.subdomains).toEqual(['www']);
      expect(request.protocol).toEqual('https');
      expect(request.secure).toEqual(true);
    });

    test('request should parse absolute url with query', () => {
      request = new Request('/some/path?foo=bar&fiz=fuz');
      expect(request.originalUrl).toEqual('/some/path?foo=bar&fiz=fuz');
      expect(request.path).toEqual('/some/path');
      expect(request.baseUrl).toEqual('');
      expect(request.method).toEqual('GET');
      expect(request.hostname).toBeUndefined();
      expect(request.query).toEqual({ fiz: 'fuz', foo: 'bar' });
      expect(request.subdomains).toEqual([]);
      expect(request.protocol).toEqual('http');
      expect(request.secure).toEqual(false);
    });

    test('request should allow to set headers', () => {
      request = new Request('/', {
        headers: {
          Accept: 'text/html',
        },
      });
      expect(request.headers).toEqual({
        accept: 'text/html',
      });
    });

    test('request should allow to set method', () => {
      request = new Request('/', {
        method: 'POST',
      });
      expect(request.method).toEqual('POST');
    });

    test('request should allow to set application', () => {
      const app = new Express();
      app.set('title', 'value');
      expect(new Request(null, { app }).app.get('title')).toEqual('value');
    });

    test('request should reset to initial values upon resetMocked', () => {
      request = new Request('https://www.example.com:3000/some/path?foo=bar', {
        headers: { Accept: 'text/html' },
        method: 'POST',
      });
      request.setMethod('GET');
      request.setProtocol('http');
      request.setHeaders({ Accept: 'text/xml', 'Accept-Language': 'pl' });
      request.setBaseUrl('foobar');
      request.setHostname('fizfuz');
      request.setQuery({ lol: 'lol' });
      request.setSubdomains('lol');
      request.setSecure(false);
      request.resetMocked();
      expect(request.originalUrl).toEqual('/some/path?foo=bar');
      expect(request.path).toEqual('/some/path');
      expect(request.baseUrl).toEqual('');
      expect(request.method).toEqual('POST');
      expect(request.headers).toEqual({ accept: 'text/html', host: 'www.example.com:3000' });
      expect(request.hostname).toEqual('www.example.com');
      expect(request.query).toEqual({ foo: 'bar' });
      expect(request.subdomains).toEqual(['www']);
      expect(request.protocol).toEqual('https');
      expect(request.secure).toEqual(true);
    });
  });

  describe('Test setUrl', () => {
    let actualDomain: string;

    beforeEach(() => {
      actualDomain = chance.domain();
    });

    it('should set the path property with pathname', () => {
      const actualPath = chance.word();
      const actualUrl = chance.url({
        domain: actualDomain,
        path: actualPath,
      });

      request.setUrl(actualUrl);

      expect(request.path).toEqual(`/${actualPath}`);
    });

    it('should set the path property with /', () => {
      const actualUrl = 'https://';

      request.setUrl(actualUrl);

      expect(request.path).toEqual('/');
    });

    it('should set the hostname property with hostname', () => {
      const actualUrl = `https://${actualDomain}`;

      request.setUrl(actualUrl);

      expect(request.hostname).toEqual(actualDomain);
    });

    it('should leave hostname undefined for a bare http:// URL', () => {
      const actualUrl = 'http://';

      request.setUrl(actualUrl);

      expect(request.hostname).toBeUndefined();
    });

    it('should set the originalUrl property with pathName and search query', () => {
      const actualPath = chance.word();
      const actualUrl = chance.url({
        domain: actualDomain,
        path: actualPath,
      });

      request.setUrl(`${actualUrl}?search=stuff`);

      expect(request.originalUrl).toEqual(`/${actualPath}?search=stuff`);
    });

    it('should set the originalUrl property with pathName', () => {
      const actualUrl = 'https://';

      request.setUrl(actualUrl);

      expect(request.originalUrl).toEqual('/');
    });

    it('should set the query property with the query', () => {
      const actualPath = chance.word();
      const actualUrl = chance.url({
        domain: actualDomain,
        path: actualPath,
      });

      request.setUrl(`${actualUrl}?search=stuff`);

      expect(request.query).toEqual({
        search: 'stuff',
      });
    });

    it('should set the protocol property with the protocol', () => {
      const actualUrl = `http://${actualDomain}`;

      request.setUrl(actualUrl);

      expect(request.protocol).toEqual('http');
      expect(request.secure).toEqual(false);
    });

    it('should set the secure property to true if the protocol is https', () => {
      const actualUrl = `https://${actualDomain}`;

      request.setUrl(actualUrl);

      expect(request.protocol).toEqual('https');
      expect(request.secure).toEqual(true);
    });

    it('should set the subdomains property to the subdomain', () => {
      const actualSubDomain = chance.word();
      const actualUrl = `https://${actualSubDomain}.${actualDomain}`;

      request.setUrl(actualUrl);

      expect(request.subdomains).toEqual([actualSubDomain]);
    });

    it('should set the headers property to the passed headers', () => {
      const actualUrl = `https://${actualDomain}/`;
      const actualHeaders = {
        auth: 'LET_ME_IN',
      };

      request.setUrl(actualUrl, {
        headers: actualHeaders,
      });

      // An absolute URL also derives the Host header, like a real client.
      expect(request.headers).toEqual({ ...actualHeaders, host: actualDomain });
    });

    it('should set the method property to the passed method', () => {
      const actualUrl = `https://${actualDomain}/`;
      const actualMethod = 'POST';

      request.setUrl(actualUrl, {
        method: actualMethod,
      });

      expect(request.method).toEqual(actualMethod);
    });
  });

  describe('Test baseUrl', () => {
    test('baseUrl should be empty by default', () => {
      expect(request.baseUrl).toEqual('');
    });

    test('baseUrl should allow you to update it', () => {
      const url1 = chance.url();
      request.setBaseUrl(url1);
      expect(request.baseUrl).toEqual(url1);

      const url2 = chance.url();
      request.setBaseUrl(url2);
      expect(request.baseUrl).toEqual(url2);
    });

    test('baseUrl should be empty after reset', () => {
      const url = chance.url();
      request.setBaseUrl(url);

      request.resetMocked();

      expect(request.baseUrl).toEqual('');
    });
  });

  describe('Test body', () => {
    test('req.body defaults to undefined like Express 5', () => {
      expect(request.body).toBeUndefined();
    });

    test('body should allow you to update it', () => {
      const body1 = chance.string();
      request.setBody(body1);
      expect(request.body).toEqual(body1);

      const body2 = chance.string();
      request.setBody(body2);
      expect(request.body).toEqual(body2);
    });

    test('req.body resets to undefined like Express 5', () => {
      const body = chance.string();
      request.setBody(body);

      request.resetMocked();

      expect(request.body).toBeUndefined();
    });
  });

  describe('Test cookies', () => {
    test('cookies should be empty by default', () => {
      expect(request.cookies).toEqual({});
    });

    test('cookies should allow you to update it', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();
      request.setCookies(firstKey, firstValue);
      expect(request.cookies).toHaveProperty(firstKey, firstValue);

      request.setCookies(secondKey, secondValue);
      expect(request.cookies).toHaveProperty(firstKey, firstValue);
      expect(request.cookies).toHaveProperty(secondKey, secondValue);
    });

    test('cookies should allow you to update it with object', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();

      request.setCookies({
        [firstKey]: firstValue,
        [secondKey]: secondValue,
      });

      expect(request.cookies).toHaveProperty(firstKey, firstValue);
      expect(request.cookies).toHaveProperty(secondKey, secondValue);
    });

    test('cookies should be empty after reset', () => {
      const key = chance.string();
      const value = chance.string();
      request.setCookies(key, value);

      request.resetMocked();

      expect(request.cookies).toEqual({});
    });
  });

  describe('Test fresh', () => {
    test('fresh should be false by default', () => {
      expect(request.fresh).toEqual(false);
    });

    test('fresh should allow you to update it', () => {
      request.setFresh(true);
      expect(request.fresh).toEqual(true);

      request.setFresh(false);
      expect(request.fresh).toEqual(false);
    });

    test('fresh should be VALUE after reset', () => {
      request.setFresh(true);

      request.resetMocked();

      expect(request.fresh).toEqual(false);
    });
  });

  describe('Test hostname', () => {
    test('hostname is undefined by default, as in Express 5 without a Host header', () => {
      expect(request.hostname).toBeUndefined();
    });

    test('hostname should allow you to update it', () => {
      request.setHostname('foobar');
      expect(request.hostname).toEqual('foobar');

      request.setHostname('fizfuz');
      expect(request.hostname).toEqual('fizfuz');
    });

    test('hostname is undefined after reset', () => {
      request.setHostname('foobar');

      request.resetMocked();

      expect(request.hostname).toBeUndefined();
    });
  });

  describe('Test host (Express 5)', () => {
    test('req.host returns undefined when there is no Host header', () => {
      expect(request.host).toBeUndefined();
    });

    test('req.host returns the bare Host header', () => {
      request.setHeaders('Host', 'example.com');

      expect(request.host).toBe('example.com');
    });

    test('req.host includes the port from the Host header', () => {
      request.setHeaders('Host', 'example.com:3000');

      expect(request.host).toBe('example.com:3000');
    });

    test('req.host keeps the brackets and port of an IPv6 Host header', () => {
      request.setHeaders('Host', '[::1]:3000');

      expect(request.host).toBe('[::1]:3000');
    });

    test('req.host ignores X-Forwarded-Host while trust proxy is off', () => {
      request.setHeaders({ host: 'example.com', 'x-forwarded-host': 'proxy.example:8080' });

      expect(request.host).toBe('example.com');
    });

    test('req.host uses X-Forwarded-Host when trust proxy is enabled', () => {
      const app = new Express();
      app.set('trust proxy', true);
      const req = new Request(null, { app });
      req.setHeaders({ host: 'example.com', 'x-forwarded-host': 'proxy.example:8080' });

      expect(req.host).toBe('proxy.example:8080');
    });

    test('req.host takes the first value of a comma-separated X-Forwarded-Host', () => {
      const app = new Express();
      app.enable('trust proxy');
      const req = new Request(null, { app });
      req.setHeaders({
        host: 'example.com',
        'x-forwarded-host': 'proxy1.example:8080, proxy2.example:9090 ',
      });

      expect(req.host).toBe('proxy1.example:8080');
    });

    test('req.host falls back to the Host header after resetMocked clears trust proxy', () => {
      const app = new Express();
      app.set('trust proxy', true);
      const req = new Request(null, { app });
      req.setHeaders({ host: 'example.com', 'x-forwarded-host': 'proxy.example:8080' });

      app.resetMocked();

      expect(req.host).toBe('example.com');
    });

    test('createRequest derives the Host header from an absolute URL like a real client', () => {
      request.setUrl('http://example.com:3000/x');

      expect(request.headers.host).toBe('example.com:3000');
      expect(request.host).toBe('example.com:3000');
      expect(request.hostname).toBe('example.com');
    });

    test('createRequest keeps an IPv6 host and port in the derived Host header', () => {
      request.setUrl('http://[::1]:3000/x');

      expect(request.headers.host).toBe('[::1]:3000');
      expect(request.host).toBe('[::1]:3000');
    });

    test('explicit headers win over the URL-derived Host header', () => {
      request = new Request('http://example.com:3000/x', {
        headers: { Host: 'custom.example:1', Accept: 'text/html' },
      });

      expect(request.host).toBe('custom.example:1');
      expect(request.headers).toEqual({ host: 'custom.example:1', accept: 'text/html' });
    });

    test('req.host follows setUrl and resetMocked restores the constructor URL host', () => {
      const req = new Request('http://example.com:3000/x');
      expect(req.host).toBe('example.com:3000');

      req.setUrl('http://other.example:8080/y');
      expect(req.host).toBe('other.example:8080');

      req.setHeaders('Host', 'override.example');
      expect(req.host).toBe('override.example');

      req.resetMocked();
      expect(req.host).toBe('example.com:3000');
    });
  });

  describe('hostname follows the Host header (Express 5)', () => {
    test.each([
      ['example.com', 'example.com'],
      ['example.com:3000', 'example.com'],
      ['[::1]:3000', '[::1]'],
      ['[::1]', '[::1]'],
    ])('Host %j gives hostname %j', (host, hostname) => {
      request.setHeaders('Host', host);
      expect(request.hostname).toBe(hostname);
    });

    test('hostname uses X-Forwarded-Host when the app trusts the proxy', () => {
      const app = new Express();
      const req = app.request;
      req.setHeaders({ Host: 'internal:8080', 'X-Forwarded-Host': 'public.example:443' });
      expect(req.hostname).toBe('internal');

      app.enable('trust proxy');
      expect(req.hostname).toBe('public.example');
    });

    test('setHostname() overrides the derived hostname until resetMocked()', () => {
      request.setHeaders('Host', 'example.com:3000');
      request.setHostname('override.example');
      expect(request.hostname).toBe('override.example');

      request.resetMocked();
      expect(request.hostname).toBeUndefined();
    });

    test('setUrl(url, { headers }) replaces the headers and still adds the URL host', () => {
      const req = new Request('/a', { headers: { 'X-Old': '1' } });

      req.setUrl('http://example.com:3000/b', { headers: { 'X-New': '2' } });

      expect(req.headers).toEqual({ 'x-new': '2', host: 'example.com:3000' });
      expect(req.hostname).toBe('example.com');
    });
  });

  describe('Test headers', () => {
    test('headers should be empty by default', () => {
      expect(request.headers).toEqual({});
    });

    test('headers should allow you to update it', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();
      request.setHeaders(firstKey, firstValue);
      expect(request.headers).toHaveProperty(firstKey, firstValue);

      request.setHeaders(secondKey, secondValue);
      expect(request.headers).toHaveProperty(firstKey, firstValue);
      expect(request.headers).toHaveProperty(secondKey, secondValue);
    });

    test('headers should allow you to update it with object', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();

      request.setHeaders({
        [firstKey]: firstValue,
        [secondKey]: secondValue,
      });

      expect(request.headers).toHaveProperty(firstKey, firstValue);
      expect(request.headers).toHaveProperty(secondKey, secondValue);
    });

    test('params should be empty after reset', () => {
      const key = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const value = chance.string();
      request.setHeaders(key, value);

      request.resetMocked();

      expect(request.headers).toEqual({});
    });
  });

  describe('Test ip', () => {
    test('ip should be ::1 by default', () => {
      expect(request.ip).toEqual('::1');
    });

    test('ip should allow you to update it', () => {
      const firstValue = chance.ip();
      request.setIp(firstValue);
      expect(request.ip).toEqual(firstValue);

      const secondValue = chance.ip();
      request.setIp(secondValue);
      expect(request.ip).toEqual(secondValue);
    });

    test('ip should be ::1 after reset', () => {
      request.setIp('1.1.1.1');
      request.resetMocked();

      expect(request.ip).toEqual('::1');
    });
  });

  describe('Test ips', () => {
    test('ips should be VALUE by default', () => {
      expect(request.ips).toHaveLength(0);
    });

    test('ips should allow you to update it', () => {
      const firstValue = chance.ip();
      request.setIps(firstValue);

      expect(request.ips).toHaveLength(1);
      expect(request.ips).toContain(firstValue);

      const secondValue = chance.ip();
      request.setIps(secondValue);

      expect(request.ips).toHaveLength(2);
      expect(request.ips).toContain(firstValue);
      expect(request.ips).toContain(secondValue);
    });

    test('ips should be VALUE after reset', () => {
      const firstValue = chance.ip();
      request.setIps(firstValue);

      request.resetMocked();

      expect(request.ips).toHaveLength(0);
    });
  });

  describe('Test method', () => {
    test('method should be GET by default', () => {
      expect(request.method).toEqual('GET');
    });

    test('method should allow you to update it', () => {
      const firstValue = chance.pickone(['GET', 'POST', 'PUT', 'DELETE']);
      request.setMethod(firstValue);
      expect(request.method).toEqual(firstValue);

      const secondValue = chance.pickone(['GET', 'POST', 'PUT', 'DELETE']);
      request.setMethod(secondValue);
      expect(request.method).toEqual(secondValue);
    });

    test('method should be GET after reset', () => {
      const value = chance.pickone(['GET', 'POST', 'PUT', 'DELETE']);
      request.setMethod(value);

      request.resetMocked();

      expect(request.method).toEqual('GET');
    });
  });

  describe('Test originalUrl', () => {
    test('originalUrl should be empty by default', () => {
      expect(request.originalUrl).toEqual('');
    });

    test('originalUrl should allow you to update it', () => {
      const firstValue = chance.url();
      request.setOriginalUrl(firstValue);
      expect(request.originalUrl).toEqual(firstValue);

      const secondValue = chance.url();
      request.setOriginalUrl(secondValue);
      expect(request.originalUrl).toEqual(secondValue);
    });

    test('originalUrl should be empty after reset', () => {
      const value = chance.url();
      request.setOriginalUrl(value);

      request.resetMocked();

      expect(request.originalUrl).toEqual('');
    });
  });

  describe('Test params', () => {
    test('params should be empty by default', () => {
      expect(request.params).toEqual({});
    });

    test('params should allow you to update it', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();
      request.setParams(firstKey, firstValue);
      expect(request.params).toHaveProperty(firstKey, firstValue);

      request.setParams(secondKey, secondValue);
      expect(request.params).toHaveProperty(firstKey, firstValue);
      expect(request.params).toHaveProperty(secondKey, secondValue);
    });

    test('params should allow you to update it with object', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();

      request.setParams({
        [firstKey]: firstValue,
        [secondKey]: secondValue,
      });

      expect(request.params).toHaveProperty(firstKey, firstValue);
      expect(request.params).toHaveProperty(secondKey, secondValue);
    });

    test('params should be empty after reset', () => {
      const key = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const value = chance.string();
      request.setParams(key, value);

      request.resetMocked();

      expect(request.params).toEqual({});
    });
  });

  describe('Test path', () => {
    test('path should be empty by default', () => {
      expect(request.path).toEqual('');
    });

    test('path should allow you to update it', () => {
      const firstValue = chance.string();
      request.setPath(firstValue);
      expect(request.path).toEqual(firstValue);

      const secondValue = chance.string();
      request.setPath(secondValue);
      expect(request.path).toEqual(secondValue);
    });

    test('path should be empty after reset', () => {
      const value = chance.string();
      request.setPath(value);

      request.resetMocked();

      expect(request.path).toEqual('');
    });
  });

  describe('Test protocol', () => {
    test('protocol should be http by default', () => {
      expect(request.protocol).toEqual('http');
    });

    test('protocol should allow you to update it', () => {
      const firstValue = chance.string();
      request.setProtocol(firstValue);
      expect(request.protocol).toEqual(firstValue);

      const secondValue = chance.string();
      request.setProtocol(secondValue);
      expect(request.protocol).toEqual(secondValue);
    });

    test('protocol should be http after reset', () => {
      const value = chance.string();
      request.setProtocol(value);

      request.resetMocked();

      expect(request.protocol).toEqual('http');
    });
  });

  describe('Test query', () => {
    test('query should be empty by default', () => {
      expect(request.query).toEqual({});
    });

    test('query should allow you to update it', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      request.setQuery(firstKey, firstValue);
      expect(request.query).toHaveProperty(firstKey, firstValue);

      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();
      request.setQuery(secondKey, secondValue);
      expect(request.query).toHaveProperty(firstKey, firstValue);
      expect(request.query).toHaveProperty(secondKey, secondValue);
    });

    test('query should be empty after reset', () => {
      const key = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const value = chance.string();
      request.setQuery(key, value);

      request.resetMocked();

      expect(request.query).toEqual({});
    });

    test('query should allow you to update it by passing object', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();
      request.setQuery({
        [firstKey]: firstValue,
        [secondKey]: secondValue,
      });
      expect(request.query).toHaveProperty(firstKey, firstValue);
      expect(request.query).toHaveProperty(secondKey, secondValue);
    });
  });

  describe('Test route', () => {
    test('route should be empty by default', () => {
      expect(request.route).toEqual({});
    });

    test('route should allow you to update it', () => {
      const userValue = chance.string();
      const authenticatedValue = chance.bool();
      request.setRoute('user', userValue);
      expect(request.route).toHaveProperty('user', userValue);

      request.setRoute('authenticated', authenticatedValue);
      expect(request.route).toHaveProperty('user', userValue);
      expect(request.route).toHaveProperty('authenticated', authenticatedValue);
    });

    test('route should allow you to update it with object', () => {
      const userValue = chance.string();
      const authenticatedValue = chance.bool();

      request.setRoute({
        authenticated: authenticatedValue,
        user: userValue,
      });

      expect(request.route).toHaveProperty('user', userValue);
      expect(request.route).toHaveProperty('authenticated', authenticatedValue);
    });

    test('route should be VALUE after reset', () => {
      const userValue = chance.string();
      request.setRoute('user', userValue);
      request.resetMocked();

      expect(request.route).toEqual({});
    });
  });

  describe('Test secure', () => {
    test('secure should be false by default', () => {
      expect(request.secure).toEqual(false);
    });

    test('secure should allow you to update it', () => {
      const firstValue = chance.bool();
      request.setSecure(firstValue);
      expect(request.secure).toEqual(firstValue);

      const secondValue = chance.bool();
      request.setSecure(secondValue);
      expect(request.secure).toEqual(secondValue);
    });

    test('secure should be false after reset', () => {
      const value = chance.bool();
      request.setSecure(value);

      request.resetMocked();

      expect(request.secure).toEqual(false);
    });
  });

  describe('Test stale', () => {
    test('stale should be false by default', () => {
      expect(request.stale).toEqual(false);
    });

    test('stale should allow you to update it', () => {
      const fisrtValue = chance.bool();
      request.setStale(fisrtValue);
      expect(request.stale).toEqual(fisrtValue);

      const secondValue = chance.bool();
      request.setStale(secondValue);
      expect(request.stale).toEqual(secondValue);
    });

    test('stale should be false after reset', () => {
      const value = chance.bool();
      request.setStale(value);

      request.resetMocked();

      expect(request.stale).toEqual(false);
    });
  });

  describe('Test subdomains', () => {
    test('subdomains should be empty by default', () => {
      expect(request.subdomains).toHaveLength(0);
    });

    test('subdomains should allow you to update it', () => {
      const firstValue = chance.string();
      request.setSubdomains(firstValue);

      expect(request.subdomains).toHaveLength(1);
      expect(request.subdomains).toContain(firstValue);

      const secondValue = chance.string();
      request.setSubdomains(secondValue);

      expect(request.subdomains).toHaveLength(2);
      expect(request.subdomains).toContain(firstValue);
      expect(request.subdomains).toContain(secondValue);
    });

    test('subdomains should be VALUE after reset', () => {
      const value = chance.string();
      request.setSubdomains(value);

      request.resetMocked();

      expect(request.subdomains).toHaveLength(0);
    });
  });

  describe('Test xhr', () => {
    test('xhr should be false by default', () => {
      expect(request.xhr).toEqual(false);
    });

    test('xhr should allow you to update it', () => {
      const firstValue = chance.bool();
      request.setXhr(firstValue);
      expect(request.xhr).toEqual(firstValue);

      const secondValue = chance.bool();
      request.setXhr(secondValue);
      expect(request.xhr).toEqual(secondValue);
    });

    test('xhr should be false after reset', () => {
      const value = chance.bool();
      request.setXhr(value);

      request.resetMocked();

      expect(request.xhr).toEqual(false);
    });
  });

  describe('Test accepts', () => {
    test('accepts should have no calls by default', () => {
      expect(request.accepts).not.toHaveBeenCalled();
    });

    test('accepts should be called and match called with', () => {
      const types = chance.string();

      request.accepts(types);

      expect(request.accepts).toHaveBeenCalled();
      expect(request.accepts).toHaveBeenCalledWith(types);
    });

    test('accepts should have no call after reset', () => {
      const types = chance.string();
      request.accepts(types);

      request.resetMocked();

      expect(request.accepts).not.toHaveBeenCalled();
    });
  });

  describe('Test acceptsCharsets', () => {
    test('acceptsCharsets should have no calls by default', () => {
      expect(request.acceptsCharsets).not.toHaveBeenCalled();
    });

    test('acceptsCharsets should be called and match called with', () => {
      const charset = chance.string();

      request.acceptsCharsets(charset);

      expect(request.acceptsCharsets).toHaveBeenCalled();
      expect(request.acceptsCharsets).toHaveBeenCalledWith(charset);
    });

    test('acceptsCharsets should have no call after reset', () => {
      const charset = chance.string();
      request.acceptsCharsets(charset);

      request.resetMocked();

      expect(request.acceptsCharsets).not.toHaveBeenCalled();
    });
  });

  describe('Test acceptsEncodings', () => {
    test('acceptsEncodings should have no calls by default', () => {
      expect(request.acceptsEncodings).not.toHaveBeenCalled();
    });

    test('acceptsEncodings should be called and match called with', () => {
      const encoding = chance.string();

      request.acceptsEncodings(encoding);

      expect(request.acceptsEncodings).toHaveBeenCalled();
      expect(request.acceptsEncodings).toHaveBeenCalledWith(encoding);
    });

    test('acceptsEncodings should have no call after reset', () => {
      const encoding = chance.string();
      request.acceptsEncodings(encoding);

      request.resetMocked();

      expect(request.acceptsEncodings).not.toHaveBeenCalled();
    });
  });

  describe('Test acceptsLanguages', () => {
    test('acceptsLanguages should have no calls by default', () => {
      expect(request.acceptsLanguages).not.toHaveBeenCalled();
    });

    test('acceptsLanguages should be called and match called with', () => {
      const lang = chance.string();

      request.acceptsLanguages(lang);

      expect(request.acceptsLanguages).toHaveBeenCalled();
      expect(request.acceptsLanguages).toHaveBeenCalledWith(lang);
    });

    test('acceptsLanguages should have no call after reset', () => {
      const lang = chance.string();
      request.acceptsLanguages(lang);

      request.resetMocked();

      expect(request.acceptsLanguages).not.toHaveBeenCalled();
    });
  });

  describe('Test get', () => {
    test('get should have no calls by default', () => {
      expect(request.get).not.toHaveBeenCalled();
    });

    test('get should be called and match called with', () => {
      const field = chance.string();

      request.get(field);

      expect(request.get).toHaveBeenCalled();
      expect(request.get).toHaveBeenCalledWith(field);
    });

    test('get should have no call after reset', () => {
      const field = chance.string();
      request.get(field);

      request.resetMocked();

      expect(request.get).not.toHaveBeenCalled();
    });

    test('should return header value', () => {
      const key = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const value = chance.string();

      request.setHeaders(key, value);

      expect(request.get(key)).toEqual(value);
    });

    test('should return header value when key is uppercase', () => {
      const key = chance.string({ pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });
      const value = chance.string();

      request.setHeaders(key, value);

      expect(request.get(key)).toEqual(value);
    });

    test('should return header value when case differs', () => {
      const key = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const value = chance.string();

      request.setHeaders(key.slice(0, 1).toUpperCase() + key.slice(1), value);

      expect(request.get(key.slice(0, 2).toUpperCase() + key.slice(2))).toEqual(value);
    });

    test('should be aliased as header', () => {
      expect(request.get).toBe(request.header);
    });
  });

  describe('Test is', () => {
    test.each([
      ['application/json', ['APPLICATION/JSON'], false],
      ['application/json', ['*/*'], 'application/json'],
      ['application/json', ['*/json'], 'application/json'],
      ['text/html', ['text/*'], 'text/html'],
      ['multipart/form-data; boundary=x', ['multipart'], 'multipart'],
      ['application/vnd.api+json', ['json'], false],
      ['application/vnd.api+json', ['+json'], 'application/vnd.api+json'],
      ['application/vnd.api+json', ['*/*+json'], 'application/vnd.api+json'],
      ['application/vnd.api+json', ['application/*+json'], 'application/vnd.api+json'],
      ['application/json', ['+json'], false],
      ['text/html', ['htm'], 'htm'],
      ['application/octet-stream', ['bin'], 'bin'],
      ['text/javascript', ['mjs'], 'mjs'],
      ['application/json; charset=utf-8', ['json'], 'json'],
      ['APPLICATION/JSON', ['json'], 'json'],
      ['application/json;bad', ['json'], 'json'],
      ['application/json', ['html', 'json'], 'json'],
      ['application/json', [['html', 'json']], 'json'],
      ['application/json', ['unknown', 'application/json'], 'application/json'],
      ['text/html', ['html', 'text/html'], 'html'],
      ['text/plain', ['text'], 'text'],
      ['text/plain', ['txt'], 'txt'],
      ['application/x-www-form-urlencoded', ['urlencoded'], 'urlencoded'],
      ['application/json', ['.json'], '.json'],
      ['application/json', ['JSON'], 'JSON'],
      ['application/json', ['html'], false],
      ['application/json', ['unknown'], false],
      ['application/json', ['application/json; charset=utf-8'], false],
      ['application/json', [], 'application/json'],
      ['application/json; charset=utf-8', [[]], 'application/json'],
      ['', ['json'], false],
      ['invalid', ['json'], false],
      ['text/*', ['text/*'], false],
      ['application/json/extra', [], false],
      ['application/json\n', [], false],
    ])('req.is with Content-Type %j and arguments %j returns %j', (header, args, expected) => {
      request.setHeaders({ 'Content-Type': header, 'Content-Length': '1' });
      expect(request.is(...args)).toBe(expected);
    });

    test.each([
      [{}, null],
      [{ 'Content-Length': '0' }, 'json'],
      [{ 'Content-Length': '10' }, 'json'],
      [{ 'Content-Length': '' }, 'json'],
      [{ 'Content-Length': '  ' }, 'json'],
      [{ 'Content-Length': '1.5' }, 'json'],
      [{ 'Content-Length': 'invalid' }, null],
      [{ 'Transfer-Encoding': 'chunked' }, 'json'],
      [{ 'Transfer-Encoding': '' }, 'json'],
    ])('req.is detects a body from headers %j and returns %j', (headers, expected) => {
      request.setHeaders({ 'Content-Type': 'application/json', ...headers });
      expect(request.is('json')).toBe(expected);
    });

    test('req.is returns false when a body has no Content-Type', () => {
      request.setHeaders('Content-Length', '0');
      expect(request.is('json')).toBe(false);
    });

    test.each([null, false, 0, '', {}, []])(
      'req.is treats a directly assigned body %j as present without framing headers',
      (body) => {
        request.setHeaders('Content-Type', 'application/json');
        request.body = body;
        expect(request.is('json')).toBe('json');
      },
    );

    test('req.is treats setBody as present and undefined as absent', () => {
      request.setHeaders('Content-Type', 'application/json');
      request.setBody({ id: 1 });
      expect(request.is('json')).toBe('json');
      request.setBody(undefined);
      expect(request.is('json')).toBeNull();
    });

    test('req.is restores matching and clears body and call history after resetMocked', () => {
      request.setBody({});
      request.is.mockReturnValue('overridden');
      request.is('json');
      request.resetMocked();
      expect(request.is).not.toHaveBeenCalled();
      expect(request.is('json')).toBeNull();
      request.setHeaders({ 'Content-Type': 'application/json', 'Content-Length': '0' });
      expect(request.is('json')).toBe('json');
    });

    test('is should have no calls by default', () => {
      expect(request.is).not.toHaveBeenCalled();
    });

    test('is should be called and match called with', () => {
      const type = chance.string();

      request.is(type);

      expect(request.is).toHaveBeenCalled();
      expect(request.is).toHaveBeenCalledWith(type);
    });

    test('is should have no call after reset', () => {
      const type = chance.string();
      request.is(type);

      request.resetMocked();

      expect(request.is).not.toHaveBeenCalled();
    });
  });

  describe('Test range', () => {
    test('range should have no calls by default', () => {
      expect(request.range).not.toHaveBeenCalled();
    });

    test('range should be called and match called with', () => {
      const size = chance.natural();
      const options = {};

      request.range(size, options);

      expect(request.range).toHaveBeenCalled();
      expect(request.range).toHaveBeenCalledWith(size, options);
    });

    test('range should have no call after reset', () => {
      const size = chance.natural();
      const options = {};
      request.range(size, options);

      request.resetMocked();

      expect(request.range).not.toHaveBeenCalled();
    });
  });

  describe('Test signedCookies', () => {
    test('signedCookies should be empty by default', () => {
      expect(request.signedCookies).toEqual({});
    });

    test('signedCookies should allow you to update it', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();
      request.setSignedCookies(firstKey, firstValue);
      expect(request.signedCookies).toHaveProperty(firstKey, firstValue);

      request.setSignedCookies(secondKey, secondValue);
      expect(request.signedCookies).toHaveProperty(firstKey, firstValue);
      expect(request.signedCookies).toHaveProperty(secondKey, secondValue);
    });

    test('signedCookies should allow you to update it with object', () => {
      const firstKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const firstValue = chance.string();
      const secondKey = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
      const secondValue = chance.string();

      request.setSignedCookies({
        [firstKey]: firstValue,
        [secondKey]: secondValue,
      });

      expect(request.signedCookies).toHaveProperty(firstKey, firstValue);
      expect(request.signedCookies).toHaveProperty(secondKey, secondValue);
    });

    test('signedCookies should be empty after reset', () => {
      const key = chance.string();
      const value = chance.string();
      request.setSignedCookies(key, value);

      request.resetMocked();

      expect(request.signedCookies).toEqual({});
    });
  });
});
