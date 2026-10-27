import { STATUS_CODES } from 'node:http';

import { contentTypes } from './mime';
import { createMock, type MockFn, type Procedure, resetMock } from './mock';
import type { ResponseHelpers } from './types';

function withDefaultCharset(value: string): string {
  const mediaType = value.split(';')[0].trim().toLowerCase();
  if (
    (mediaType.startsWith('text/') || mediaType === 'application/json') &&
    !/;\s*charset\s*=/i.test(value)
  ) {
    return `${value}; charset=utf-8`;
  }
  return value;
}

// https://expressjs.com/en/4x/api.html#res
export class Response implements ResponseHelpers {
  // Properties
  public headers: Record<string, unknown>;

  public headersSent: boolean;

  public locals: Record<string, unknown>;

  public statusCode: number;

  // Methods
  public append: MockFn<Procedure>;

  public attachment: MockFn<Procedure>;

  public body: unknown;

  public cookie: MockFn<Procedure>;

  public clearCookie: MockFn<Procedure>;

  public download: MockFn<Procedure>;

  public end: MockFn<Procedure>;

  public format: MockFn<Procedure>;

  public get: MockFn<Procedure>;

  public header: MockFn<Procedure>;

  public json: MockFn<Procedure>;

  public jsonp: MockFn<Procedure>;

  public links: MockFn<Procedure>;

  public location: MockFn<Procedure>;

  public redirect: MockFn<Procedure>;

  public render: MockFn<Procedure>;

  public send: MockFn<Procedure>;

  public sendFile: MockFn<Procedure>;

  public sendStatus: MockFn<Procedure>;

  public set: MockFn<Procedure>;

  public setHeader: MockFn<Procedure>;

  public status: MockFn<Procedure>;

  public type: MockFn<Procedure>;

  public text: ResponseHelpers['text'];

  public vary: MockFn<Procedure>;

  public removeHeader: MockFn<Procedure>;

  constructor() {
    // Properties
    this.headers = Object.create(null);
    this.headersSent = false;
    this.locals = {};
    this.body = {};
    this.statusCode = 200;
    const setDefaultContentType = (value: string) => {
      if (this.getHeader('Content-Type') === undefined) {
        this.setHeader('Content-Type', value);
      }
    };
    // Methods
    this.append = createMock(() => this);
    this.attachment = createMock(() => this);
    this.cookie = createMock(() => this);
    this.clearCookie = createMock(() => this);
    this.download = createMock();
    this.end = createMock((data: unknown) => {
      if (data !== undefined) {
        this.body = data;
      }
      return this;
    });
    this.format = createMock(() => this);
    this.get = createMock((key: string) => this.getHeader(key));
    this.header = createMock((key: string, value: string | undefined) => {
      if (typeof value === 'string') {
        this.set(key, value);
      } else {
        this.set(key);
      }
      return this;
    });
    this.json = createMock((data: unknown) => {
      setDefaultContentType('application/json; charset=utf-8');
      this.body = data;
      return this;
    });
    this.jsonp = createMock((data: unknown) => {
      this.setHeader('X-Content-Type-Options', 'nosniff');
      setDefaultContentType('application/json; charset=utf-8');
      this.body = data;
      return this;
    });
    this.links = createMock((links: Record<string, string | string[]>) => {
      let link = this.get('Link') || '';
      if (link) link += ', ';
      return this.set(
        'Link',
        link +
          Object.keys(links)
            .map((rel) => {
              // Allow multiple links if links[rel] is an array, as in Express 5.1+.
              if (Array.isArray(links[rel])) {
                return links[rel].map((single) => `<${single}>; rel="${rel}"`).join(', ');
              }
              return `<${links[rel]}>; rel="${rel}"`;
            })
            .join(', '),
      );
    });
    this.location = createMock((path: string) => {
      this.setHeader('Location', String(path));
      return this;
    });
    this.redirect = createMock((...args: [string] | [number, string]) => {
      const status = args.length === 2 ? args[0] : 302;
      const url = args.length === 2 ? args[1] : args[0];
      // Express sets redirect headers before validating the status.
      this.location(url);
      this.vary('Accept');
      this.type('txt');
      this.status(status);
      const body = `${STATUS_CODES[status]}. Redirecting to ${this.get('Location')}`;
      this.setHeader('Content-Length', String(Buffer.byteLength(body)));
      this.end(body);
    });
    this.render = createMock();
    this.send = createMock((data: unknown) => {
      if (typeof data === 'string') {
        setDefaultContentType('text/html; charset=utf-8');
      } else if (Buffer.isBuffer(data)) {
        setDefaultContentType('application/octet-stream');
      } else if (
        typeof data === 'number' ||
        typeof data === 'boolean' ||
        (data !== null && typeof data === 'object')
      ) {
        setDefaultContentType('application/json; charset=utf-8');
      }
      this.body = data;
      return this;
    });
    this.sendFile = createMock();
    this.sendStatus = createMock((code: number) => {
      this.status(code);
      setDefaultContentType('text/plain; charset=utf-8');
      this.body = STATUS_CODES[code] || String(code);
      return this;
    });
    this.set = createMock((key: string | { [key: string]: string }, value: string | undefined) => {
      if (typeof key === 'string') {
        this.setHeader(
          key,
          key.toLowerCase() === 'content-type' && typeof value === 'string'
            ? withDefaultCharset(value)
            : value,
        );
      } else {
        for (const k of Object.keys(key)) {
          this.set(k, key[k]);
        }
      }
      return this;
    });
    this.setHeader = createMock((key: string, value: string) => {
      this.headers[key.toLowerCase()] = value;
      return this;
    });
    this.status = createMock((statusCode: number): this => {
      if (!Number.isInteger(statusCode)) {
        throw new TypeError(
          `Invalid status code: ${JSON.stringify(statusCode)}. Status code must be an integer.`,
        );
      }
      if (statusCode < 100 || statusCode > 999) {
        throw new RangeError(
          `Invalid status code: ${JSON.stringify(statusCode)}. Status code must be greater than 99 and less than 1000.`,
        );
      }
      this.statusCode = statusCode;
      return this;
    });
    this.type = createMock((type: string) => {
      const value = type.includes('/')
        ? type
        : (contentTypes.get(type.replace(/^\./, '').toLowerCase()) ?? 'application/octet-stream');
      this.set('Content-Type', value);
      return this;
    });
    // The public helper view exposes the Express response rather than this internal class.
    this.text = createMock((data: unknown) => {
      this.body = data;
      return this;
    }) as unknown as ResponseHelpers['text'];
    this.vary = createMock((field: string | string[]) => {
      if (!field) throw new TypeError('field argument is required');
      // Only spaces are optional around comma-separated HTTP field names.
      const parseFields = (value: string) =>
        value.split(',').map((part) => part.replace(/^ +| +$/g, ''));
      const fields = Array.isArray(field) ? field : parseFields(String(field));
      if (fields.some((name) => !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name))) {
        throw new TypeError('field argument contains an invalid header name');
      }
      const stored = this.getHeader('Vary') || '';
      let header = Array.isArray(stored) ? stored.join(', ') : String(stored);
      const names = new Set(parseFields(header.toLowerCase()));
      if (fields.includes('*') || names.has('*')) {
        header = '*';
      } else {
        for (const name of fields) {
          if (!names.has(name.toLowerCase())) {
            header = header ? `${header}, ${name}` : name;
            names.add(name.toLowerCase());
          }
        }
      }
      if (header) this.setHeader('Vary', header);
      return this;
    });
    this.removeHeader = createMock((key: string) => {
      delete this.headers[key.toLowerCase()];
      return this;
    });
  }

  public getHeader(key: string): unknown {
    return this.headers[key.toLowerCase()];
  }

  public setHeadersSent(value: boolean) {
    this.headersSent = value;
  }

  public setLocals(key: string, value: string) {
    this.locals[key] = value;
  }

  public resetMocked() {
    // Properties
    this.headers = Object.create(null);
    this.headersSent = false;
    this.locals = {};
    this.statusCode = 200;
    // Methods
    resetMock(this.append);
    resetMock(this.attachment);
    resetMock(this.cookie);
    this.body = {};
    resetMock(this.clearCookie);
    resetMock(this.download);
    resetMock(this.end);
    resetMock(this.format);
    resetMock(this.get);
    resetMock(this.header);
    resetMock(this.json);
    resetMock(this.jsonp);
    resetMock(this.links);
    resetMock(this.location);
    resetMock(this.redirect);
    resetMock(this.render);
    resetMock(this.send);
    resetMock(this.sendFile);
    resetMock(this.sendStatus);
    resetMock(this.set);
    resetMock(this.setHeader);
    resetMock(this.status);
    resetMock(this.text);
    resetMock(this.type);
    resetMock(this.vary);
    resetMock(this.removeHeader);
  }
}
