# Jest Express
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![CircleCI](https://circleci.com/gh/jameswlane/jest-express.svg?style=svg)](https://circleci.com/gh/jameswlane/jest-express)
[![Greenkeeper badge](https://badges.greenkeeper.io/jameswlane/jest-express.svg)](https://greenkeeper.io/)
[![dependencies Status](https://david-dm.org/jameswlane/jest-express/status.svg)](https://david-dm.org/jameswlane/jest-express)
[![Maintainability](https://api.codeclimate.com/v1/badges/9487b570f339c75e15f6/maintainability)](https://codeclimate.com/github/jameswlane/jest-express/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9487b570f339c75e15f6/test_coverage)](https://codeclimate.com/github/jameswlane/jest-express/test_coverage)
[![codecov](https://codecov.io/gh/jameswlane/jest-express/branch/master/graph/badge.svg)](https://codecov.io/gh/jameswlane/jest-express)
[![devDependencies Status](https://david-dm.org/jameswlane/jest-express/dev-status.svg)](https://david-dm.org/jameswlane/jest-express?type=dev)


[![Waffle.io - Columns and their card count](https://badge.waffle.io/jameswlane/jest-express.svg?columns=all)](https://waffle.io/jameswlane/jest-express)

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
    * [cookie()](#responsecookie)
    * [clearCookie()](#responseclearcookie)
    * [download()](#responsedownload)
    * [end()](#responseend)
    * [format()](#responseformat)
    * [get()](#responseget)
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
    * [type()](#responsetype)
    * [vary()](#responsevary)
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
    request = new Request();
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

Ways to use this API:

Setup:
```js
beforeEach(() => {
  request = new Request();
  request.setQuery(query);
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

Ways to use this API:

```js
expect(response.set).toBeCalledWith(field [, value]);
```

#### `response.status()`

Ways to use this API:

```js
expect(response.status).toBeCalledWith(code);
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
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/794161?v=4" width="100px;"/><br /><sub><b>James W. Lane III</b></sub>](http://fueledbydreams.com)<br />[💻](https://github.com/jameswlane/jest-express/commits?author=jameswlane "Code") [📖](https://github.com/jameswlane/jest-express/commits?author=jameswlane "Documentation") [🚇](#infra-jameswlane "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/jameswlane/jest-express/commits?author=jameswlane "Tests") [🔧](#tool-jameswlane "Tools") | [<img src="https://avatars1.githubusercontent.com/u/3869412?v=4" width="100px;"/><br /><sub><b>Jeroen Engels</b></sub>](https://github.com/jfmengels)<br />[🐛](https://github.com/jameswlane/jest-express/issues?q=author%3Ajfmengels "Bug reports") [💻](https://github.com/jameswlane/jest-express/commits?author=jfmengels "Code") [⚠️](https://github.com/jameswlane/jest-express/commits?author=jfmengels "Tests") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!