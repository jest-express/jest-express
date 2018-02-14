declare const jest: any;

export class Request {
  // Properties
  public baseUrl: string;
  public body: string;
  public cookies: any;
  public fresh: boolean;
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

  constructor() {
    // Properties
    this.baseUrl = '';
    this.body = '';
    this.cookies = {};
    this.fresh = false;
    this.hostname = '';
    this.ip = '';
    this.ips = [];
    this.method = '';
    this.originalUrl = '';
    this.params = {};
    this.path = '';
    this.protocol = '';
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
    this.get = jest.fn();
    this.is = jest.fn();
    this.range = jest.fn();
    return this;
  }

  public resetMocked() {
    // Properties
    this.baseUrl = '';
    this.body = '';
    this.cookies = {};
    this.fresh = false;
    this.hostname = '';
    this.ip = '';
    this.ips = [];
    this.method = '';
    this.originalUrl = '';
    this.params = {};
    this.path = '';
    this.protocol = '';
    this.query = {};
    this.route = {};
    this.secure = false;
    this.signedCookies = {};
    this.stale = false;
    this.subdomains = [];
    this.xhr = false;
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

  public setCookies(key: string, value: string) {
    this.cookies[key] = value;
  }

  public setFresh(value: boolean) {
    this.fresh = value;
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

  public setParams(key: string, value: string) {
    this.params[key] = value;
  }

  public setPath(value: string) {
    this.path = value;
  }

  public setProtocol(value: string) {
    this.protocol = value;
  }

  public setQuery(key: string, value: string) {
    this.query[key] = value;
  }

  public setRoute(key: string, value: string) {
    this.route[key] = value;
  }

  public setSecure(value: boolean) {
    this.secure = value;
  }

  public setSignedCookies(key: string, value: string) {
    this.signedCookies[key] = value;
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
