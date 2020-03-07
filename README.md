# Jest Express
[![All Contributors](https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square)](#contributors)
[![CircleCI](https://circleci.com/gh/jameswlane/jest-express.svg?style=svg)](https://circleci.com/gh/jameswlane/jest-express)
[![dependencies Status](https://david-dm.org/jameswlane/jest-express/status.svg)](https://david-dm.org/jameswlane/jest-express)
[![Maintainability](https://api.codeclimate.com/v1/badges/9487b570f339c75e15f6/maintainability)](https://codeclimate.com/github/jameswlane/jest-express/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9487b570f339c75e15f6/test_coverage)](https://codeclimate.com/github/jameswlane/jest-express/test_coverage)
[![codecov](https://codecov.io/gh/jameswlane/jest-express/branch/master/graph/badge.svg)](https://codecov.io/gh/jameswlane/jest-express)
[![devDependencies Status](https://david-dm.org/jameswlane/jest-express/dev-status.svg)](https://david-dm.org/jameswlane/jest-express?type=dev)
[![Downloads/week](https://img.shields.io/npm/dw/jest-express.svg)](https://npmjs.org/package/jest-express)

Mock Express for testing with Jest

* [express()](#express)
    * [json()](#expressjson)
    * [static()](#expressstatic)
    * [Router()](#expressrouter)
    * [urlencoded()](#expressurlencoded)
    * [resetMocked()](#resetmocked)
* [Application](#application)
    * [locals](#applocals)
    * [mountpath](#appmountpath)
    * [all()](#appall)
    * [delete()](#appdelete)
    * [disable()](#appdisable)
    * [disabled()](#appdisabled)
    * [enable()](#appenable)
    * [enabled()](#appenabled)
    * [engine()](#appengine)
    * [get()](#appget)
    * [listen()](#applisten)
    * [head()](#apphead)
    * [post()](#apppost)
    * [put()](#appput)
    * [connect()](#appconnect)
    * [options()](#appoptions)
    * [trace()](#apptrace)
    * [patch()](#apppatch)
    * [param()](#appparam)
    * [path()](#apppath)
    * [render()](#apprender)
    * [route()](#approute)
    * [set()](#appset)
    * [use()](#appuse)
    * [request()](#apprequest)
    * [response()](#appresponse)
    * [setMountPath()](#appmountpath)
    * [setLocals()](#applocals)
    * [resetMocked()](#resetmocked)
* [Request](#request)
    * [baseUrl](#requestbaseUrl)
    * [body](#requestbody)
    * [cookies](#requestcookies)
    * [fresh](#requestfresh)
    * [hostname](#requesthostname)
    * [ip](#requestip)
    * [ips](#requestips)
    * [method](#requestmethod)
    * [originalUrl](#requestoriginalurl)
    * [params](#requestbaseUrl)
    * [path](#requestpath)
    * [protocol](#requestprotocol)
    * [query](#requestquery)
    * [route](#requestroute)
    * [baseUrl](#requestbaseurl)
    * [secure](#requestsecure)
    * [signedCookies](#requestsignedcookies)
    * [stale](#requeststale)
    * [subdomains](#requestsubdomains)
    * [xhr](#requestxhr)
    * [accepts()](#requestaccepts)
    * [acceptsCharsets()](#requestacceptscharsets)
    * [acceptsEncodings()](#requestacceptsEncodings)
    * [acceptsLanguages()](#requestacceptsLanguages)
    * [get()](#requestget)
    * [is()](#requestis)
    * [range()](#requestrange)
    * [setBaseUrl()](#requestsetbaseurl)
    * [setBody()](#requestsetbody)
    * [setCookies()](#requestsetcookies)
    * [setFresh()](#requestsetfresh)
    * [setHostname()](#requestsethostname)
    * [setHeaders()](#requestsetheaders)
    * [setIp()](#requestsetip)
    * [setIps()](#requestsetips)
    * [setMethod()](#requestsetmethod)
    * [setOriginalUrl()](#requestsetoriginalurl)
    * [setParams()](#requestsetparams)
    * [setPath()](#requestsetpath)
    * [setProtocol()](#requestsetprotocol)
    * [setQuery()](#requestsetquery)
    * [setRoute()](#requestsetroute)
    * [setSecure()](#requestsetsecure)
    * [setSignedCookies()](#requestsetsignedcookies)
    * [setStale()](#requestsetStale)
    * [setSubdomains()](#requestsetsubdomains)
    * [setXhr()](#requestsetXhr)
    * [resetMocked()](#resetmocked)
* [Response](#response)
    * [headersSent](#responseheaderssent)
    * [locals](#responselocals)
    * [append()](#responseappend)
    * [attachment()](#responseattachment)
    * [body](#reponsebody)
    * [cookie()](#responsecookie)
    * [clearCookie()](#responseclearcookie)
    * [download()](#responsedownload)
    * [end()](#responseend)
    * [format()](#responseformat)
    * [get()](#responseget)
    * [getHeader()](#responsegetheader)
    * [header()](#responseheader)
    * [json()](#responsejson)
    * [jsonp()](#responsejsonp)
    * [links()](#responselinks)
    * [location()](#responselocation)
    * [redirect()](#responseredirect)
    * [render()](#responserender)
    * [send()](#responsesend)
    * [sendFile()](#responsesendfile)
    * [sendStatus()](#responsesendstatus)
    * [set()](#responseset)
    * [status()](#responsestatus)
    * [statusCode]($responsestatuscode)
    * [type()](#responsetype)
    * [vary()](#responsevary)
    * [setHeader()](#responsesetheader)
    * [removeHeader()](#responseremoveHeader)
    * [setHeadersSent()](#responsesetheaderssent)
    * [setLocals()](#responsesetlocals)
    * [resetMocked()](#resetmocked)
* [Router](#router)
    * [request()](#routerrequest)
    * [response()](#routerresponse)
    * [all()](#routerall)
    * [get()](#routerget)
    * [param()](#routerparam)
    * [route()](#routerroute)
    * [use()](#routeruse)
    * [resetMocked()](#resetmocked)

_Other_

1. [Development](#development)
1. [Contributing](#contributing)
1. [License](#license)

### `express()`

How to setup Application to use in Jest:

```js
jest.mock('express', () => {
  return require('jest-express');
});
```

#### `express.json()`

Ways to use this API:

```js
expect(express.json).toHaveBeenCalledWith([options]);
```

#### `express.static()`

Ways to use this API:

```js
expect(express.static).toHaveBeenCalledWith(root, [options]);
```

#### `express.Router()`

Ways to use this API:

```js
expect(express.Router).toHaveBeenCalledWith([options]);
```

#### `express.urlencoded()`

Ways to use this API:

```js
expect(express.urlencoded).toHaveBeenCalledWith([options]);
```

### `Application`

How to setup Application to use in Jest:

```js
import { Express } from 'jest-express/lib/express';
import { server } from '../src/server.js';

let app;

describe('Server', () => {
  beforeEach(() => {
    app = new Express();
  });

  afterEach(() => {
    app.resetMocked();
  });

  test('should setup server', () => {
    const options = {
      port: 3000,
    };

    server(app, options);

    expect(app.set).toBeCalledWith('port', options.port);
  });
});
```

#### `app.locals`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  app = new Express();
  app.setLocals('title', 'My App');
});
```

#### `app.mountpath`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  app = new Express();
  app.setMountPath('/admin');
});
```

#### `app.all()`

Ways to use this API:

```js
expect(app.all).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.get()`

Ways to use this API:

```js
expect(app.get).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.head()`

Ways to use this API:

```js
expect(app.head).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.post()`

Ways to use this API:

```js
expect(app.post).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.put()`

Ways to use this API:

```js
expect(app.put).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.delete()`

Ways to use this API:

```js
expect(app.delete).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.connect()`

Ways to use this API:

```js
expect(app.connect).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.options()`

Ways to use this API:

```js
expect(app.options).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.trace()`

Ways to use this API:

```js
expect(app.trace).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.patch()`

Ways to use this API:

```js
expect(app.patch).toBeCalledWith(path, callback [, callback ...]);
```

#### `app.param()`

Ways to use this API:

```js
expect(app.param).toBeCalledWith([name], callback);
```

#### `app.render()`

Ways to use this API:

```js
expect(app.param).toBeCalledWith(view, [locals], callback);
```

#### `app.use()`

Ways to use this API:

```js
expect(app.use).toBeCalledWith([path,] callback [, callback...]);
```

### `Request`

How to setup Request to use in Jest:

```js
import { Request } from 'jest-express/lib/request';
import { endpoint } from '../src/endpoint.js';

let request;

describe('Endpoint', () => {
  beforeEach(() => {
    request = new Request('/users?sort=desc', {
      headers: {
        Accept: 'text/html'
      }
    });
  });

  afterEach(() => {
    request.resetMocked();
  });

  test('should setup endpoint', () => {
    endpoint(request);

    expect(request).toBeCalled();
  });
});
```

#### `request.baseUrl`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setBaseUrl(baseUrl);
});
```

#### `request.body`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setBody(body);
});
```

#### `request.cookies`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setCookies(cookies);
});
```

#### `request.fresh`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setFresh(boolean);
});
```

#### `request.hostname`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setHostname(string);
});
```

#### `request.setHeaders`

Ways to use this API:

Setup:

```js
beforeEach(() => {
  request = new Request();
  request.setHeaders("X-Custom-Header", "foo");
});

// or

beforeEach(() => {
  request = new Request();
  request.setHeaders({  
    "X-Custom-Header", "foo",
    "X-Custom-Header-2", "bar"
  });
});

```

#### `request.ip`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setIp(ip);
});
```

#### `request.ips`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setIps(ips);
});
```

#### `request.method`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setMethod(method);
});
```

#### `request.originalUrl`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setOriginalUrl(originalUrl);
});
```

#### `request.params`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setParams(params);
});
```

#### `request.path`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setPath(path);
});
```

#### `request.protocol`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setProtocol(protocol);
});
```

#### `request.query`

You can use it by passing key value pair:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setQuery('Accept', 'text/html');
});
```

Or by passing an object:

```js
beforeEach(() => {
  request = new Request();
  request.setQuery({ 'Accept': 'text/html', 'Accept-Language': 'en' });
});
```

#### `request.route`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setRoute(route);
});
```

#### `request.secure`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setSecure(secure);
});
```

#### `request.signedCookies`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setSignedCookies(signedCookies);
});
```

#### `request.stale`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setStale(boolean);
});
```

#### `request.subdomains`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setSubdomains(subdomains);
});
```

#### `request.xhr`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setXhr(boolean);
});
```

#### `request.accepts()`

Ways to use this API:

```js
expect(request.accepts).toBeCalledWith(types);
```

#### `request.acceptsCharsets()`

Ways to use this API:

```js
expect(request.acceptsCharsets).toBeCalledWith(charset [, ...]);
```

#### `request.acceptsEncodings()`

Ways to use this API:

```js
expect(request.acceptsEncodings).toBeCalledWith(encoding [, ...]);
```

#### `request.acceptsLanguages()`

Ways to use this API:

```js
expect(request.acceptsLanguages).toBeCalledWith(lang [, ...]);
```

#### `request.get()`

Ways to use this API:

```js
expect(request.get).toBeCalledWith(field);
```

#### `request.is()`

Ways to use this API:

```js
expect(request.is).toBeCalledWith(type);
```

#### `request.param()`

Ways to use this API:

```js
expect(request.param).toBeCalledWith(name [, defaultValue]);
```

#### `request.range()`

Ways to use this API:

```js
expect(request.range).toBeCalledWith(size[, options]);
```

### `Response`

How to setup Response to use in Jest:

```js
import { Response } from 'jest-express/lib/response';
import { endpoint } from '../src/endpoint.js';

let response;

describe('Endpoint', () => {
  beforeEach(() => {
    response = new Response();
  });

  afterEach(() => {
    response.resetMocked();
  });

  test('should setup endpoint', () => {
    endpoint(response);

    expect(response).toBeCalled();
  });
});
```

#### `response.setHeader`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  response = new Response();
  response.setHeader(key, value);
  expect(response.setHeader).toBeCalledWith(key, value);
});
```

#### `response.removeHeader`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  response = new Response();
  response.removeHeader(key);
  expect(response.removeHeader).toBeCalledWith(key);
});
```

#### `response.headersSent`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  response = new Response();
  response.setHeadersSent(boolean);
});
```

#### `response.locals`

Ways to use this API:

Setup:
```js
beforeEach(() => {
  response = new Response();
  response.setLocals('title', 'My App');
});
```

#### `response.append()`

Ways to use this API:

```js
expect(response.append).toBeCalledWith(field [, value]);
```

#### `response.attachment()`

Ways to use this API:

```js
expect(response.attachment).toBeCalledWith([filename]);
```

#### `reponse.body`

Ways to use this API:

```js
expect(response.body).toEqual(value);
```

#### `response.cookie()`

Ways to use this API:

```js
expect(response.cookie).toBeCalledWith(name, value [, options]);
```

#### `response.clearCookie()`

Ways to use this API:

```js
expect(response.clearCookie).toBeCalledWith(name [, options]);
```

#### `response.download()`

Ways to use this API:

```js
expect(response.download).toBeCalledWith(path [, filename] [, options] [, fn]);
```

#### `response.end()`

Ways to use this API:

```js
expect(response.end).toBeCalledWith([data] [, encoding]);
```

#### `response.format()`

Ways to use this API:

```js
expect(response.format).toBeCalledWith(object);
```

#### `response.get()`

Ways to use this API:

```js
expect(response.get).toBeCalledWith(field);
```

#### `response.getHeader()`

Ways to use this API:

```js
response.setHeader('Accept', 'text/html')
expect(response.getHeader('Accept')).toEqual('text/html');
```

#### `response.header()`

An alias for `response.set()`

```js
expect(response.header).toBeCalledWith(field, [value]);
```

#### `response.json()`

Ways to use this API:

```js
expect(response.json).toBeCalledWith([body]);
```

#### `response.jsonp()`

Ways to use this API:

```js
expect(response.jsonp).toBeCalledWith([body]);
```

#### `response.links()`

Ways to use this API:

```js
expect(response.links).toBeCalledWith(links);
```

#### `response.location()`

Ways to use this API:

```js
expect(response.location).toBeCalledWith(path);
```

#### `response.redirect()`

Ways to use this API:

```js
expect(response.redirect).toBeCalledWith([status,] path);
```

#### `response.render()`

Ways to use this API:

```js
expect(response.render).toBeCalledWith(view [, locals] [, callback]);
```

#### `response.send()`

Ways to use this API:

```js
expect(response.send).toBeCalledWith([body]);
```

#### `response.sendFile()`

Ways to use this API:

```js
expect(response.sendFile).toBeCalledWith(path [, options] [, fn]);
```

#### `response.sendStatus()`

Ways to use this API:

```js
expect(response.sendStatus).toBeCalledWith(statusCode);
```

#### `response.set()`

Sets headers. It is calling `response.setHeader()` internally.

```js
expect(response.set).toBeCalledWith(field [, value]);
```

#### `response.status()`

Ways to use this API:

```js
expect(response.status).toBeCalledWith(code);
```

#### `response.statusCode`

ways to use this API:
```js
expect(response.statusCode).toEqual(code);
```

#### `response.type()`

Ways to use this API:

```js
expect(response.type).toBeCalledWith(type);
```
 
#### `response.vary()`

Ways to use this API:

```js
expect(response.vary).toBeCalledWith(field);
```

### `Router`

How to setup Response to use in Jest:

```js
import { Router } from 'jest-express/lib/router';
import { endpoint } from '../src/endpoint.js';

let router;

describe('Endpoint', () => {
  beforeEach(() => {
    router = new Router();
  });

  afterEach(() => {
    router.resetMocked();
  });

  test('should setup endpoint', () => {
    endpoint(router);

    expect(router).toBeCalled();
  });
});
```

#### `router.all()`

Ways to use this API:

```js
expect(router.all).toBeCalledWith(path, [callback, ...] callback);
```

#### `router.get()`

Ways to use this API:

```js
expect(router.get).toBeCalledWith(path, [callback, ...] callback);
```

#### `router.param()`

Ways to use this API:

```js
expect(router.param).toBeCalledWith(name, callback);
```

#### `router.route()`

Ways to use this API:

```js
expect(router.route).toBeCalledWith(path);
```

#### `router.use()`

Ways to use this API:

```js
expect(router.use).toBeCalledWith([path], [function, ...] function);
```

#### `resetMocked()`

Resets all information stored in the mock, including any initial implementation and mock name given.

This is useful when you want to completely restore a mock back to its initial state.

## Development

#### Setup

```shell
$ git clone git@github.com:jameswlane/jest-express.git
$ cd jest-express
$ npm install
```

#### Tests

Linters:

```shell
$ npm run tslint
```

Tests:

```shell
$ npm test
```

## Contributing

## License

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://fueledbydreams.com"><img src="https://avatars2.githubusercontent.com/u/794161?v=4" width="100px;" alt=""/><br /><sub><b>James W. Lane III</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=jameswlane" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=jameswlane" title="Documentation">📖</a> <a href="#infra-jameswlane" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/jameswlane/jest-express/commits?author=jameswlane" title="Tests">⚠️</a> <a href="#tool-jameswlane" title="Tools">🔧</a></td>
    <td align="center"><a href="http://sheerun.net"><img src="https://avatars0.githubusercontent.com/u/292365?v=4" width="100px;" alt=""/><br /><sub><b>Adam Stankiewicz</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/issues?q=author%3Asheerun" title="Bug reports">🐛</a> <a href="https://github.com/jameswlane/jest-express/commits?author=sheerun" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=sheerun" title="Documentation">📖</a> <a href="https://github.com/jameswlane/jest-express/commits?author=sheerun" title="Tests">⚠️</a> <a href="#example-sheerun" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/gjtorikian"><img src="https://avatars1.githubusercontent.com/u/64050?v=4" width="100px;" alt=""/><br /><sub><b>Garen Torikian</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=gjtorikian" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=gjtorikian" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/G07cha"><img src="https://avatars3.githubusercontent.com/u/6943514?v=4" width="100px;" alt=""/><br /><sub><b>Konstantin Azizov</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=G07cha" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/dozenne"><img src="https://avatars3.githubusercontent.com/u/1186932?v=4" width="100px;" alt=""/><br /><sub><b>dozenne</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=dozenne" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=dozenne" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/racer01"><img src="https://avatars2.githubusercontent.com/u/14020544?v=4" width="100px;" alt=""/><br /><sub><b>László Székely-Tóth</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=racer01" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=racer01" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/mattmarcello"><img src="https://avatars2.githubusercontent.com/u/4753479?v=4" width="100px;" alt=""/><br /><sub><b>mattmarcello</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=mattmarcello" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=mattmarcello" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://hrkeni.me"><img src="https://avatars1.githubusercontent.com/u/1170292?v=4" width="100px;" alt=""/><br /><sub><b>Harshith Keni</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=hrkeni" title="Code">💻</a></td>
    <td align="center"><a href="https://www.maxholman.com"><img src="https://avatars3.githubusercontent.com/u/250517?v=4" width="100px;" alt=""/><br /><sub><b>Max Holman</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=maxholman" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=maxholman" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/mnalsup"><img src="https://avatars3.githubusercontent.com/u/5252756?v=4" width="100px;" alt=""/><br /><sub><b>Matthew Alsup</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=mnalsup" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ttxndrx"><img src="https://avatars3.githubusercontent.com/u/6355781?v=4" width="100px;" alt=""/><br /><sub><b>ttxndrx</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=ttxndrx" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/benbakhar"><img src="https://avatars1.githubusercontent.com/u/7517258?v=4" width="100px;" alt=""/><br /><sub><b>Ben Bakhar</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=benbakhar" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=benbakhar" title="Tests">⚠️</a> <a href="https://github.com/jameswlane/jest-express/commits?author=benbakhar" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/tamias"><img src="https://avatars1.githubusercontent.com/u/478001?v=4" width="100px;" alt=""/><br /><sub><b>Ronald J Kimball</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=tamias" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=tamias" title="Tests">⚠️</a></td>
  </tr>
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
