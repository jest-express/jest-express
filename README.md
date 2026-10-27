# jest-express

Mock Express 5 apps, routers, requests, responses and `next` functions for unit tests.
This monorepo provides runner-specific packages for Vitest and Jest, plus a runner-agnostic
core for other test runners. Mocks are typed against `@types/express` v5, so you can pass
them directly to Express handlers.

Use these packages to test handler behavior and middleware registration without starting
a server. Use [supertest](https://github.com/ladjs/supertest) with real Express for
integration tests that exercise URL matching, nested routers or the HTTP stack.

## Packages

| Package | Use it when | Documentation |
| --- | --- | --- |
| [`vitest-express`](packages/vitest-express/) | Your tests use Vitest. It configures `vi.fn` automatically and is ESM-only. | [Vitest guide](packages/vitest-express/README.md) |
| [`jest-express`](packages/jest-express/) | Your tests use Jest. It configures `jest.fn` automatically and supports ESM and CommonJS. | [Jest guide](packages/jest-express/README.md) |
| [`express-mock-core`](packages/express-mock-core/) | You use another runner with a compatible `fn()` mock factory. | [Core API and setup](packages/express-mock-core/README.md) |

`express-mock-core` is a working name; the core package will be renamed before its first release.
All three packages require Node 22 or newer. Install `@types/express` v5 for TypeScript
support. The packages are versioned and released together.

## Quick start with Vitest

Install the wrapper and Vitest:

```sh
pnpm add -D vitest-express vitest
```

Load the wrapper once from your setup files. It configures the mock factory before any
mocks are created:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { setupFiles: ['vitest-express'] },
});
```

Then create fresh mocks in each test:

```ts
import { expect, test } from 'vitest';
import type { RequestHandler } from 'express';
import { createNext, createRequest, createResponse } from 'vitest-express';

const handler: RequestHandler = (req, res) => {
  res.status(201).json({ ok: true });
};

test('calls a handler with Express-compatible mocks', () => {
  const req = createRequest();
  const res = createResponse();
  const next = createNext();

  handler(req, res, next);

  expect(res.statusCode).toBe(201);
  expect(res.body).toEqual({ ok: true });
  expect(next).not.toHaveBeenCalled();
});
```

See the [Vitest guide](packages/vitest-express/README.md) for handler, middleware, router,
error handler and async recipes.

## Quick start with Jest

Install the wrapper and Jest:

```sh
pnpm add -D jest-express jest
```

Load the wrapper once from your setup files:

```js
// jest.config.cjs
module.exports = { setupFiles: ['jest-express'] };
```

Then create mocks and call your code under test:

```js
const { createNext, createRequest, createResponse } = require('jest-express');

const handler = (req, res) => {
  res.status(201).json({ ok: true });
};

test('calls a handler with Express-compatible mocks', () => {
  const req = createRequest();
  const res = createResponse();
  const next = createNext();

  handler(req, res, next);

  expect(res.statusCode).toBe(201);
  expect(res.body).toEqual({ ok: true });
  expect(next).not.toHaveBeenCalled();
});
```

See the [Jest guide](packages/jest-express/README.md) for ESM, CommonJS and complete testing
recipes. For another runner, see [configuring the core directly](packages/express-mock-core/README.md#configure-the-mock-factory).

## More documentation

- [Full core API reference](packages/express-mock-core/README.md#api-reference)
- [Migrating from jest-express 1.x](docs/MIGRATING-2.0.md)
- [Express 5 example app](examples/express5-app/)
- [Contributing](CONTRIBUTING.md)

Licensed under [MIT](LICENSE).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://fueledbydreams.com"><img src="https://avatars2.githubusercontent.com/u/794161?v=4" width="100px;" alt=""/><br /><sub><b>James W. Lane III</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=jameswlane" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=jameswlane" title="Documentation">📖</a> <a href="#infra-jameswlane" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/jameswlane/jest-express/commits?author=jameswlane" title="Tests">⚠️</a> <a href="#tool-jameswlane" title="Tools">🔧</a></td>
    <td align="center"><a href="http://sheerun.net"><img src="https://avatars0.githubusercontent.com/u/292365?v=4" width="100px;" alt=""/><br /><sub><b>Adam Stankiewicz</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/issues?q=author%3Asheerun" title="Bug reports">🐛</a> <a href="https://github.com/jameswlane/jest-express/commits?author=sheerun" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=sheerun" title="Documentation">📖</a> <a href="https://github.com/jameswlane/jest-express/commits?author=sheerun" title="Tests">⚠️</a> <a href="#example-sheerun" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/gjtorikian"><img src="https://avatars1.githubusercontent.com/u/64050?v=4" width="100px;" alt=""/><br /><sub><b>Garen Torikian</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=gjtorikian" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/G07cha"><img src="https://avatars1.githubusercontent.com/u/6943514?v=4" width="100px;" alt=""/><br /><sub><b>Konstantin Azizov</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=G07cha" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/dozenne"><img src="https://avatars3.githubusercontent.com/u/1186932?v=4" width="100px;" alt=""/><br /><sub><b>dozenne</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=dozenne" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=dozenne" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/racer01"><img src="https://avatars2.githubusercontent.com/u/14020544?v=4" width="100px;" alt=""/><br /><sub><b>László Székely-Tóth</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=racer01" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=racer01" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/mattmarcello"><img src="https://avatars2.githubusercontent.com/u/4753479?v=4" width="100px;" alt=""/><br /><sub><b>Matthew Alsup</b></sub></a><br /><a href="https://github.com/jameswlane/jest-express/commits?author=mattmarcello" title="Code">💻</a> <a href="https://github.com/jameswlane/jest-express/commits?author=mattmarcello" title="Tests">⚠️</a></td>
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
