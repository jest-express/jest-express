import { parse as parseQuery } from 'node:querystring';
import { URL } from 'node:url';
import { Express } from './express';
import { contentTypes, requestContentTypes } from './mime';
import { createMock, type MockFn, type Procedure, resetMock } from './mock';
import type { RequestHelpers, RequestOptions } from './types';

type AcceptKind = 'media' | 'charset' | 'encoding' | 'language';

interface Preference {
  value: string;
  params: Map<string, string>;
  q: number;
  order: number;
}

// Commas and semicolons inside quoted parameter values are not separators.
function splitHeader(value: string, separator: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let quoted = false;
  for (let i = 0; i < value.length; i++) {
    if (quoted && value[i] === '\\') {
      i++;
    } else if (value[i] === '"') {
      quoted = !quoted;
    } else if (!quoted && value[i] === separator) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

function parsePreference(value: string, order: number): Preference {
  const [type, ...parameters] = splitHeader(value, ';');
  const params = new Map<string, string>();
  for (const parameter of parameters) {
    const match = /^\s*([^=\s]+)\s*=\s*("(?:\\.|[^"\\])*"|[^\s]+)\s*$/.exec(parameter);
    // Like negotiator, ignore malformed parameters instead of throwing.
    if (!match) {
      continue;
    }
    const raw = match[2];
    params.set(
      match[1].toLowerCase(),
      raw.startsWith('"') ? raw.slice(1, -1).replace(/\\(.)/g, '$1') : raw,
    );
  }
  const q = params.get('q');
  params.delete('q');
  return { value: type.trim(), params, q: q ? Number.parseFloat(q) : 1, order };
}

function specificity(candidate: Preference, accepted: Preference, kind: AcceptKind): number {
  const value = candidate.value.toLowerCase();
  const range = accepted.value.toLowerCase();
  if (kind === 'media') {
    const [type, subtype] = value.split('/');
    const [rangeType, rangeSubtype] = range.split('/');
    if (!subtype || !rangeSubtype) return -1;
    if (rangeType !== type && rangeType !== '*') return -1;
    if (rangeSubtype !== subtype && rangeSubtype !== '*') return -1;
    for (const [key, parameter] of accepted.params) {
      if (
        parameter !== '*' &&
        parameter.toLowerCase() !== (candidate.params.get(key) || '').toLowerCase()
      ) {
        return -1;
      }
    }
    return (
      (rangeType === type ? 4 : 0) +
      (rangeSubtype === subtype ? 2 : 0) +
      (accepted.params.size ? 1 : 0)
    );
  }
  if (kind === 'language') {
    if (range === value) return 4;
    if (range.split('-')[0] === value) return 2;
    if (range === value.split('-')[0]) return 1;
  } else if (range === value) {
    return 1;
  }
  return range === '*' ? 0 : -1;
}

function negotiate(
  kind: AcceptKind,
  header: string | undefined,
  args: (string | string[])[],
): string | string[] | false {
  const provided = Array.isArray(args[0]) ? args[0] : (args as string[]);
  if (kind === 'media' && provided.length && !header) return provided[0];
  const fallback = kind === 'media' ? '*/*' : kind === 'encoding' ? '' : '*';
  const accepted = splitHeader(header === undefined ? fallback : header, ',')
    .filter((value) => value.trim())
    .map(parsePreference)
    .filter((spec) => kind !== 'media' || spec.value.includes('/'));
  if (
    kind === 'encoding' &&
    !accepted.some((spec) => ['identity', '*'].includes(spec.value.toLowerCase()))
  ) {
    accepted.push({
      value: 'identity',
      params: new Map(),
      q: Math.min(1, ...accepted.map((spec) => spec.q || 1)),
      order: accepted.length,
    });
  }
  if (!provided.length) {
    return accepted
      .filter((spec) => spec.q > 0)
      .sort((a, b) => b.q - a.q || a.order - b.order)
      .map((spec) => spec.value);
  }

  const priorities = provided.flatMap((original, index) => {
    const value =
      kind === 'media' && !original.includes('/')
        ? contentTypes.get(original.replace(/^\./, '').toLowerCase())
        : original;
    if (!value) return [];
    const candidate = parsePreference(value, index);
    let best = { q: 0, specificity: -1, order: -1 };
    for (const spec of accepted) {
      const score = specificity(candidate, spec, kind);
      // A more specific range governs this candidate even when its quality is zero.
      if (
        score >= 0 &&
        (score - best.specificity || spec.q - best.q || spec.order - best.order) > 0
      ) {
        best = { q: spec.q, specificity: score, order: spec.order };
      }
    }
    return [{ ...best, original, index }];
  });
  priorities.sort(
    (a, b) => b.q - a.q || b.specificity - a.specificity || a.order - b.order || a.index - b.index,
  );
  return priorities.find((spec) => spec.q > 0)?.original || false;
}

// type-is validates the parameter-free Content-Type using RFC 6838 names.
const mediaTypePattern = /^[a-z0-9][a-z0-9!#$&^_-]{0,126}\/[a-z0-9][a-z0-9!#$&^_.+-]{0,126}$/;

function matchContentType(header: string | undefined, args: (string | string[])[]): string | false {
  const actual = header
    ?.split(';', 1)[0]
    .replace(/^[ \t]+|[ \t]+$/g, '')
    .toLowerCase();
  if (!actual || !mediaTypePattern.test(actual)) return false;
  const types = Array.isArray(args[0]) ? args[0] : (args as string[]);
  if (!types.length) return actual;
  const [actualType, actualSubtype] = actual.split('/');
  for (const original of types) {
    if (typeof original !== 'string') continue;
    const expected =
      original === 'urlencoded'
        ? 'application/x-www-form-urlencoded'
        : original === 'multipart'
          ? 'multipart/*'
          : original.startsWith('+')
            ? `*/*${original}`
            : original.includes('/')
              ? original
              : requestContentTypes.get(
                  original.slice(original.lastIndexOf('.') + 1).toLowerCase(),
                );
    if (!expected) continue;
    const parts = expected.split('/');
    if (parts.length !== 2) continue;
    const [type, subtype] = parts;
    if (type !== '*' && type !== actualType) continue;
    const matches = subtype.startsWith('*+')
      ? subtype.length <= actualSubtype.length + 1 && actualSubtype.endsWith(subtype.slice(1))
      : subtype === '*' || subtype === actualSubtype;
    if (matches) {
      // type-is returns the actual type for wildcard and suffix candidates.
      return original.startsWith('+') || original.includes('*') ? actual : original;
    }
  }
  return false;
}

// Characters the legacy url.parse() percent-encodes in the path and query.
const autoEscape: Record<string, string> = {
  '\t': '%09',
  '\n': '%0A',
  '\r': '%0D',
  ' ': '%20',
  '"': '%22',
  "'": '%27',
  '<': '%3C',
  '>': '%3E',
  '\\': '%5C',
  '^': '%5E',
  '`': '%60',
  '{': '%7B',
  '|': '%7C',
  '}': '%7D',
};

/**
 * Split a request URL into its raw pathname and search the way Express does (through
 * parseurl), without normalising `..` or encoding non-ASCII characters like `new URL()` would.
 */
function parseRawUrl(url: string, absolute: boolean): { pathname: string; search: string } {
  // parseurl's fast path: a plain relative path is used as-is.
  if (url.startsWith('/') && !/[\t\n\f\r #\u00a0\ufeff]/.test(url)) {
    const queryStart = url.indexOf('?');
    return queryStart === -1
      ? { pathname: url, search: '' }
      : { pathname: url.slice(0, queryStart), search: url.slice(queryStart) };
  }
  // Otherwise follow url.parse(): trim, turn backslashes before the query or hash into
  // slashes, return a simple path as-is, else drop the hash, skip the scheme and host, and
  // escape the auto-escaped characters.
  let rest = url.trim();
  const end = rest.search(/[?#]/);
  rest =
    end === -1
      ? rest.replace(/\\/g, '/')
      : rest.slice(0, end).replace(/\\/g, '/') + rest.slice(end);
  const simplePath = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/.exec(rest);
  if (simplePath && !/[#@]/.test(rest)) {
    return { pathname: simplePath[1], search: simplePath[2] ?? '' };
  }
  rest = rest.split('#')[0];
  if (absolute) {
    rest = rest.replace(/^[a-z][a-z\d+.-]*:(?:\/\/[^/?]*)?/i, '');
  }
  const queryStart = rest.indexOf('?');
  const rawPath = queryStart === -1 ? rest : rest.slice(0, queryStart);
  const rawSearch = queryStart === -1 ? '' : rest.slice(queryStart);
  const autoEscapeChars = (value: string) =>
    value.replace(/[\t\n\r "'<>\\^`{|}]/g, (c) => autoEscape[c]);
  return {
    pathname: autoEscapeChars(rawPath) || '/',
    search: autoEscapeChars(rawSearch),
  };
}

// https://expressjs.com/en/4x/api.html#req
export class Request implements RequestHelpers {
  // Properties
  public baseUrl: string;

  public body: unknown;

  public cookies: Record<string, unknown>;

  public fresh: boolean;

  public headers: Record<string, string | undefined>;

  // Set by setHostname(); otherwise hostname is derived from req.host like Express 5.
  private hostnameOverride: string | undefined;

  /**
   * The host without its port, from req.host (so it honours X-Forwarded-Host when the app
   * trusts the proxy), as in Express 5. IPv6 literals keep their brackets. Undefined when
   * there is no Host header, unless setHostname() set a value.
   */
  public get hostname(): string | undefined {
    if (this.hostnameOverride !== undefined) {
      return this.hostnameOverride;
    }
    const host = this.host;
    if (!host) {
      return undefined;
    }
    const offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
    const index = host.indexOf(':', offset);
    return index === -1 ? host : host.substring(0, index);
  }

  public ip: string;

  public ips: string[];

  public method: string;

  public originalUrl: string;

  public params: Record<string, unknown>;

  public path: string;

  public protocol: string;

  private queryValues: ReturnType<typeof parseQuery>;

  public get query() {
    // Express reparses on every read. Clone arrays too so mutations do not persist.
    const query = Object.assign(Object.create(null), this.queryValues);
    for (const key of Object.keys(query)) {
      if (Array.isArray(query[key])) query[key] = [...query[key]];
    }
    return query;
  }

  /**
   * The host from the Host header, including the port. When the app trusts the proxy,
   * X-Forwarded-Host wins and a comma-separated list contributes its first value,
   * as in Express 5. Undefined when there is no Host header.
   */
  public get host(): string | undefined {
    const trust = this.app.getSetting('trust proxy fn');
    let value = this.headers['x-forwarded-host'];
    if (!value || typeof trust !== 'function' || !trust(this.ip, 0)) {
      value = this.headers.host;
    } else if (typeof value === 'string' && value.indexOf(',') !== -1) {
      value = value.substring(0, value.indexOf(',')).trimEnd();
    }
    // The public request view exposes host as a string; preserve the existing runtime value.
    return (value || undefined) as string | undefined;
  }

  public route: Record<string, unknown>;

  public secure: boolean;

  public signedCookies: Record<string, unknown>;

  public stale: boolean;

  public subdomains: string[];

  public xhr: boolean;

  // Methods
  public accepts: MockFn<Procedure>;

  public acceptsCharsets: MockFn<Procedure>;

  public acceptsEncodings: MockFn<Procedure>;

  public acceptsLanguages: MockFn<Procedure>;

  public get: MockFn<Procedure>;

  public header: MockFn<Procedure>;

  public is: MockFn<Procedure>;

  public range: MockFn<Procedure>;

  // Application
  public app: Express;

  private defaultUrl: string | undefined;

  private defaultOptions: RequestOptions | undefined;

  constructor(url?: string | null, options?: RequestOptions) {
    // Properties
    this.baseUrl = '';
    this.body = undefined;
    this.cookies = {};
    this.fresh = false;
    this.headers = {};
    this.hostnameOverride = undefined;
    this.ip = '::1';
    this.ips = [];
    this.method = 'GET';
    this.originalUrl = '';
    this.params = Object.create(null);
    this.path = '';
    this.protocol = 'http';
    this.queryValues = Object.create(null);
    this.route = {};
    this.secure = false;
    this.signedCookies = {};
    this.stale = false;
    this.subdomains = [];
    this.xhr = false;
    // Methods
    this.accepts = createMock((...types: (string | string[])[]) =>
      negotiate('media', this.headers.accept, types),
    );
    this.acceptsCharsets = createMock((...values: (string | string[])[]) =>
      negotiate('charset', this.headers['accept-charset'], values),
    );
    this.acceptsEncodings = createMock((...values: (string | string[])[]) =>
      negotiate('encoding', this.headers['accept-encoding'], values),
    );
    this.acceptsLanguages = createMock((...values: (string | string[])[]) =>
      negotiate('language', this.headers['accept-language'], values),
    );
    this.get = this.header = createMock((header: string) => this.headers[header.toLowerCase()]);
    this.is = createMock((...types: (string | string[])[]) => {
      // Tests usually supply a parsed body without HTTP framing headers.
      const hasBody =
        this.body !== undefined ||
        this.headers['transfer-encoding'] !== undefined ||
        !Number.isNaN(Number(this.headers['content-length']));
      if (!hasBody) return null;
      return matchContentType(this.headers['content-type'], types);
    });
    this.range = createMock();
    // Application
    // A user-supplied app is one of our Express mocks, typed through its public view.
    this.app = options?.app ? (options.app as unknown as Express) : new Express();

    if (typeof url === 'string') {
      this.defaultUrl = url;
      this.defaultOptions = options;
      this.setUrl(this.defaultUrl, this.defaultOptions);
    }
  }

  public setUrl(url: string, options?: RequestOptions) {
    const absolute = /^[a-z][a-z\d+.-]*:/i.test(url);
    // Keep the existing helpers' support for a bare "http://" or "https://".
    const emptyHost = /^(https?:)\/\/(?=[?#]|$)/i.test(url);
    const input = emptyHost ? url.replace(/^(https?:)\/\//i, '$1//request.invalid/') : url;
    const parsedUrl = absolute ? new URL(input) : undefined;
    const { pathname, search } = parseRawUrl(url, absolute);

    this.path = pathname;
    this.originalUrl = this.path + search;
    this.queryValues = parseQuery(search.slice(1));
    this.protocol = parsedUrl ? parsedUrl.protocol.slice(0, -1) : 'http';
    this.secure = parsedUrl?.protocol === 'https:';

    if (options) {
      if (options.headers) {
        const headers: Record<string, string | undefined> = {};
        for (const k of Object.keys(options.headers)) {
          const key = k.toLowerCase();
          // Preserve array-valued headers at runtime; negotiation reads its string inputs.
          headers[key] = options.headers[k] as string | undefined;
        }

        this.headers = { ...headers };
      }
      if (options.method) {
        this.method = options.method;
      }
    }

    // A real client requests an absolute URL with a `Host: <host>` header, and Express 5
    // derives req.host and req.hostname from it. A Host header passed in this call wins, and
    // relative URLs keep the headers as they are.
    const explicitHost = Object.keys(options?.headers ?? {}).some(
      (key) => key.toLowerCase() === 'host',
    );
    if (parsedUrl && !emptyHost && !explicitHost) {
      this.headers.host = parsedUrl.host;
    }

    const hostnameParts = (this.hostname ?? '').split('.');
    if (hostnameParts.length > 2) {
      this.subdomains = hostnameParts.slice(0, hostnameParts.length - 2);
    }
  }

  public resetMocked() {
    // Properties
    this.baseUrl = '';
    this.body = undefined;
    this.cookies = {};
    this.fresh = false;
    this.headers = {};
    this.hostnameOverride = undefined;
    this.ip = '::1';
    this.ips = [];
    this.method = 'GET';
    this.originalUrl = '';
    this.params = Object.create(null);
    this.path = '';
    this.protocol = 'http';
    this.queryValues = Object.create(null);
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
    resetMock(this.accepts);
    resetMock(this.acceptsCharsets);
    resetMock(this.acceptsEncodings);
    resetMock(this.acceptsLanguages);
    resetMock(this.get);
    resetMock(this.is);
    resetMock(this.range);
  }

  public setBaseUrl(value: string) {
    this.baseUrl = value;
  }

  public setBody(value: unknown) {
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
    this.hostnameOverride = value;
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
      this.queryValues[key] = value;
    } else {
      for (const k of Object.keys(key)) {
        this.queryValues[k] = key[k];
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

  public setSignedCookies(key: string | { [key: string]: string }, value?: string) {
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
