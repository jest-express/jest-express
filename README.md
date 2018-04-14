# Jest Express
[![Greenkeeper badge](https://badges.greenkeeper.io/jameswlane/jest-express.svg)](https://greenkeeper.io/)
[![devDependencies Status](https://david-dm.org/jameswlane/jest-express/dev-status.svg)](https://david-dm.org/jameswlane/jest-express?type=dev)

Mock Express for testing with Jest

* [express()](#express())
    * [json()](#express.json())
    * [static()](#express.static())
    * [Router()](#express.Router())
    * [urlencoded()](#express.urlencoded())
    * [resetMocked()](#resetMocked())
* [Application](#Application)
    * [locals](#app.locals)
    * [mountpath](#app.mountpath)
    * [all()](#app.all)
    * [delete()](#app.delete)
    * [disable()](#app.disable)
    * [disabled()](#app.disabled)
    * [enable()](#app.enable)
    * [enabled()](#app.enabled)
    * [engine()](#app.engine)
    * [get()](#app.get)
    * [listen()](#app.listen)
    * [head()](#app.head)
    * [post()](#app.post)
    * [put()](#app.put)
    * [connect()](#app.connect)
    * [options()](#app.options)
    * [trace()](#app.trace)
    * [patch()](#app.patch)
    * [param()](#app.param)
    * [path()](#app.path)
    * [render()](#app.render)
    * [route()](#app.route)
    * [set()](#app.set)
    * [use()](#app.use)
    * [request()](#app.request)
    * [response()](#app.response)
    * [setMountPath()](#app.mountpath)
    * [setLocals()](#app.locals)
    * [resetMocked()](#resetMocked())
* [Request](#Request)
    * [baseUrl](#baseUrl)
    * [body](#body)
    * [cookies](#cookies)
    * [fresh](#fresh)
    * [hostname](#hostname)
    * [ip](#ip)
    * [ips](#ips)
    * [method](#method)
    * [originalUrl](#originalUrl)
    * [params](#baseUrl)
    * [path](#path)
    * [protocol](#protocol)
    * [query](#query)
    * [route](#route)
    * [baseUrl](#baseUrl)
    * [secure](#secure)
    * [signedCookies](#signedCookies)
    * [stale](#stale)
    * [subdomains](#subdomains)
    * [xhr](#xhr)
    * [accepts()](#accepts)
    * [acceptsCharsets()](#acceptsCharsets)
    * [acceptsEncodings()](#acceptsEncodings)
    * [acceptsLanguages()](#acceptsLanguages)
    * [get()](#get)
    * [is()](#is)
    * [range()](#range)
    * [setBaseUrl()](#setBaseUrl)
    * [setBody()](#setBody)
    * [setCookies()](#setCookies)
    * [setFresh()](#setFresh)
    * [setIp()](#setIp)
    * [setIps()](#setIps)
    * [setMethod()](#setMethod)
    * [setOriginalUrl()](#setOriginalUrl)
    * [setParams()](#setParams)
    * [setPath()](#setPath)
    * [setProtocol()](#setProtocol)
    * [setQuery()](#setQuery)
    * [setRoute()](#setRoute)
    * [setSecure()](#setSecure)
    * [setSignedCookies()](#setSignedCookies)
    * [setStale()](#setStale)
    * [setSubdomains()](#setSubdomains)
    * [setXhr()](#setXhr)
    * [resetMocked()](#resetMocked())
* [Response](#Response)
    * [headersSent](#headersSent)
    * [locals](#locals)
    * [append()](#append)
    * [attachment()](#attachment)
    * [cookie()](#cookie)
    * [clearCookie()](#clearCookie)
    * [download()](#download)
    * [end()](#end)
    * [format()](#format)
    * [get()](#get)
    * [json()](#json)
    * [jsonp()](#jsonp)
    * [links()](#links)
    * [location()](#location)
    * [redirect()](#redirect)
    * [render()](#render)
    * [send()](#send)
    * [sendFile()](#sendFile)
    * [sendStatus()](#sendStatus)
    * [set()](#set)
    * [status()](#status)
    * [type()](#type)
    * [vary()](#vary)
    * [setHeadersSent()](#setHeadersSent)
    * [setLocals()](#setLocals)
    * [resetMocked()](#resetMocked())
* [Router](#Router)
    * [request()](#request)
    * [response()](#response)
    * [all()](#all)
    * [get()](#get)
    * [param()](#param)
    * [route()](#route)
    * [use()](#use)
    * [resetMocked()](#resetMocked())

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
