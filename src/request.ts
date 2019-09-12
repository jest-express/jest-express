import { parse } from 'url';
import { Express } from './express';

interface IRequestOptions {
  method?:
    | 'GET'
    | 'POST'
    | 'DELETE'
    | 'PATCH'
    | 'PUT'
    | 'HEAD'
    | 'OPTIONS'
    | 'CONNECT';
  headers?: any;
  app?: Express;
}

declare const jest: any;
// https://expressjs.com/en/4x/api.html#req
export class Request {
  // Properties
  public baseUrl: string;
  public body: string;
  public cookies: any;
  public fresh: boolean;
  public headers: any;
  public hostname: string;
  public ip: string;
  public ips: string[];
  public method: string;
  public originalUrl: string;
  public params: any;
  public path: string;
  public protocol: string;
  public query: any;
  public route: any;
  public secure: boolean;
  public signedCookies: any;
  public stale: boolean;
  public subdomains: string[];
  public xhr: boolean;
  // Methods
  public accepts: any;
  public acceptsCharsets: any;
  public acceptsEncodings: any;
  public acceptsLanguages: any;
  public get: any;
  public is: any;
  public range: any;
  // Application
  public app: Express;

  private defaultUrl: string | undefined;
  private defaultOptions: IRequestOptions | undefined;

  constructor(url?: string | null, options?: IRequestOptions) {
    // Properties
    this.baseUrl = '';
    this.body = '';
    this.cookies = {};
    this.fresh = false;
    this.headers = {};
    this.hostname = '';
    this.ip = '::1';
    this.ips = [];
    this.method = 'GET';
    this.originalUrl = '';
    this.params = {};
    this.path = '';
    this.protocol = 'http';
    this.query = {};
    this.route = {};
    this.secure = false;
    this.signedCookies = {};
    this.stale = false;
    this.subdomains = [];
    this.xhr = false;
    // Methods
    this.accepts = jest.fn();
    this.acceptsCharsets = jest.fn();
    this.acceptsEncodings = jest.fn();
    this.acceptsLanguages = jest.fn();
    this.get = jest
      .fn()
      .mockImplementation((header: string) => this.headers[header]);
    this.is = jest.fn();
    this.range = jest.fn();
    // Application
    this.app = options && options.app ? options.app : new Express();

    if (typeof url === 'string') {
      this.defaultUrl = url;
      this.defaultOptions = options;
      this.setUrl(this.defaultUrl, this.defaultOptions);
    }

    return this;
  }

  public setUrl(url: string, options?: IRequestOptions) {
    const parsedUrl = parse(url, true);

    this.path = parsedUrl.pathname || '/';
    this.hostname = parsedUrl.hostname || '';
    this.originalUrl = this.path + (parsedUrl.search || '');
    this.query = parsedUrl.query;
    this.protocol = parsedUrl.protocol
      ? parsedUrl.protocol.slice(0, parsedUrl.protocol.length - 1)
      : 'http';
    this.secure = parsedUrl.protocol === 'https:';

    const hostnameParts = this.hostname.split('.');
    if (hostnameParts.length > 2) {
      this.subdomains = hostnameParts.slice(0, hostnameParts.length - 2);
    }

    if (options) {
      if (options.headers) {
        const headers: any = {};
        for (const k of Object.keys(options.headers)) {
          const key = k.toLowerCase();
          headers[key] = options.headers[k];
        }

        this.headers = Object.assign({}, headers);
      }
      if (options.method) {
        this.method = options.method;
      }
    }
  }

  public resetMocked() {
    // Properties
    this.baseUrl = '';
    this.body = '';
    this.cookies = {};
    this.fresh = false;
    this.headers = {};
    this.hostname = '';
    this.ip = '::1';
    this.ips = [];
    this.method = 'GET';
    this.originalUrl = '';
    this.params = {};
    this.path = '';
    this.protocol = 'http';
    this.query = {};
    this.route = {};
    this.secure = false;
    this.signedCookies = {};
    this.stale = false;
    this.subdomains = [];
    this.xhr = false;

    if (typeof this.defaultUrl === 'string') {
      this.setUrl(this.defaultUrl, this.defaultOptions);
    }

    // Methods
    this.accepts.mockReset();
    this.acceptsCharsets.mockReset();
    this.acceptsEncodings.mockReset();
    this.acceptsLanguages.mockReset();
    this.get.mockReset();
    this.is.mockReset();
    this.range.mockReset();
  }

  public setBaseUrl(value: string) {
    this.baseUrl = value;
  }

  public setBody(value: string) {
    this.body = value;
  }

  public setCookies(key: string | { [key: string]: string }, value?: string) {
    if (typeof key === 'string') {
      this.cookies[key] = value;
    } else {
      for (const k of Object.keys(key)) {
        this.cookies[k] = key[k];
      }
    }
  }

  public setFresh(value: boolean) {
    this.fresh = value;
  }

  public setHeaders(key: string | { [key: string]: string }, value?: string) {
    if (typeof key === 'string') {
      this.headers[key.toLowerCase()] = value;
    } else {
      for (const k of Object.keys(key)) {
        this.headers[k.toLowerCase()] = key[k];
      }
    }
  }

  public setHostname(value: string) {
    this.hostname = value;
  }

  public setIp(value: string) {
    this.ip = value;
  }

  public setIps(value: string) {
    this.ips.push(value);
  }

  public setMethod(value: string) {
    this.method = value;
  }

  public setOriginalUrl(value: string) {
    this.originalUrl = value;
  }

  public setParams(key: string | { [key: string]: string }, value?: string) {
    if (typeof key === 'string') {
      this.params[key] = value;
    } else {
      for (const k of Object.keys(key)) {
        this.params[k] = key[k];
      }
    }
  }

  public setPath(value: string) {
    this.path = value;
  }

  public setProtocol(value: string) {
    this.protocol = value;
  }

  public setQuery(key: string | { [key: string]: string }, value?: string) {
    if (typeof key === 'string') {
      this.query[key] = value;
    } else {
      for (const k of Object.keys(key)) {
        this.query[k] = key[k];
      }
    }
  }

  public setRoute(key: string | { [key: string]: string }, value?: string) {
    if (typeof key === 'string') {
      this.route[key] = value;
    } else {
      for (const k of Object.keys(key)) {
        this.route[k] = key[k];
      }
    }
  }

  public setSecure(value: boolean) {
    this.secure = value;
  }

  public setSignedCookies(
    key: string | { [key: string]: string },
    value?: string,
  ) {
    if (typeof key === 'string') {
      this.signedCookies[key] = value;
    } else {
      for (const k of Object.keys(key)) {
        this.signedCookies[k] = key[k];
      }
    }
  }

  public setStale(value: boolean) {
    this.stale = value;
  }

  public setSubdomains(value: string) {
    this.subdomains.push(value);
  }

  public setXhr(value: boolean) {
    this.xhr = value;
  }
}
