import * as Chance from 'chance';

import { Express } from '../../src/express';
import { Request } from '../../src/request';

const chance = new Chance();
let request: any;

describe('Express Request', () => {
  beforeEach(() => {
    request = new Request();
  });

  afterEach(() => {
    request.resetMocked();
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
      expect(request.hostname).toEqual('');
      expect(request.query).toEqual({ fiz: 'fuz', foo: 'bar' });
      expect(request.subdomains).toEqual([]);
      expect(request.protocol).toEqual('http');
      expect(request.secure).toEqual(false);
    });

    test('request should allow to set headers', () => {
      request = new Request(
        '/',
        {
          headers: {
            Accept: 'text/html',
          },
        },
      );
      expect(request.headers).toEqual({
        accept: 'text/html',
      });
    });

    test('request should allow to set method', () => {
      request = new Request(
        '/',
        {
          method: 'POST',
        },
      );
      expect(request.method).toEqual('POST');
    });

    test('request should allow to set application', () => {
      const app = new Express();
      app.set('title', 'value');
      expect(new Request(null, { app }).app.get('title')).toEqual('value');
    });

    test('request should reset to initial values upon resetMocked', () => {
      request = new Request(
        'https://www.example.com:3000/some/path?foo=bar',
        {
          headers: { Accept: 'text/html' },
          method: 'POST',
        },
      );
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
      expect(request.headers).toEqual({ accept: 'text/html' });
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

    it('should set the hostname property with a empty string', () => {
      const actualUrl = 'http://';

      request.setUrl(actualUrl);

      expect(request.hostname).toEqual('');
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

      expect(request.headers).toEqual(actualHeaders);
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
    test('body should be empty by default', () => {
      expect(request.body).toEqual('');
    });

    test('body should allow you to update it', () => {
      const body1 = chance.string();
      request.setBody(body1);
      expect(request.body).toEqual(body1);

      const body2 = chance.string();
      request.setBody(body2);
      expect(request.body).toEqual(body2);
    });

    test('body should be empty after reset', () => {
      const body = chance.string();
      request.setBody(body);

      request.resetMocked();

      expect(request.body).toEqual('');
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
    test('hostname should be empty by default', () => {
      expect(request.hostname).toEqual('');
    });

    test('hostname should allow you to update it', () => {
      request.setHostname('foobar');
      expect(request.hostname).toEqual('foobar');

      request.setHostname('fizfuz');
      expect(request.hostname).toEqual('fizfuz');
    });

    test('hostname should be empty after reset', () => {
      request.setHostname('foobar');

      request.resetMocked();

      expect(request.hostname).toEqual('');
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
      const secondKey = chance.string({  pool: 'abcdefghijklmnopqrstuvwxyz' });
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
