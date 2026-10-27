# Contributing

Use **Node 24** for development (see `.nvmrc`) and the pnpm version pinned in the root
`package.json`. Enable Corepack, then install dependencies from the repository root:

```sh
nvm use
corepack enable
pnpm install
```

Open an issue to discuss larger changes, then send a pull request against `master`.
Keep each pull request focused on one change, and avoid unrelated formatting or dependency
updates.

## Monorepo layout

This is a pnpm workspace managed with Turborepo:

| Path | Package or purpose |
| --- | --- |
| `packages/express-mock-core/` | Runner-agnostic core. All Express mock implementations live here. |
| `packages/jest-express/` | Jest wrapper: configures `jest.fn` and re-exports the core. |
| `packages/vitest-express/` | Vitest wrapper: configures `vi.fn` and re-exports the core. ESM-only. |
| `examples/*/` | Private example apps, included as workspace members. |
| Root `package.json`, `turbo.json` | Shared development tools and cross-package tasks. |

The core has no
runtime dependencies and must not access Jest or Vitest directly. Only the wrappers' setup
modules touch a runner. The wrappers depend only on the core.

## Checks

Run these commands from the repository root. Except for `check` and `check:fix`, they run
through Turborepo and build dependencies when needed:

| Command | Purpose |
| --- | --- |
| `pnpm check` | Biome lint and format checks for the whole repository |
| `pnpm check:fix` | Apply Biome's safe lint and format fixes; review the diff |
| `pnpm typecheck` | TypeScript strict checking in every package and example |
| `pnpm test` | Core and wrapper tests, plus example tests |
| `pnpm test:types` | Vitest type tests for Express assignability and runner mock types |
| `pnpm build` | Build all packages with tsdown, including declarations |
| `pnpm lint:pkg` | Check built packages with publint and Are the Types Wrong (`attw --pack`) |
| `pnpm turbo run test --filter=express-mock-core` | Run only the core package tests |

Every behavior change needs a test that fails before the change and passes afterwards. For
documentation, verify runnable examples against the built package. Run the applicable checks
before handing off; build before `lint:pkg`. Report any check you cannot run.

Use Biome for lint and formatting. Create mocks lazily, keep instances independent, and
preserve chaining after `resetMocked()`. Match Express 5 behavior and keep public mocks
assignable to `@types/express` v5.

## Tests by package

- Core unit tests: `packages/express-mock-core/test/unit/`.
- Core type tests: `packages/express-mock-core/test/types/`.
- Jest wrapper and CommonJS compatibility tests: `packages/jest-express/test/`.
- Vitest wrapper setup tests: `packages/vitest-express/test/`.
- Example application tests: `examples/*/`, using the workspace packages.

Put behavior tests beside the package that owns the behavior. Most mock changes belong in
the core; wrapper tests should cover runner configuration, exports and runner-specific
typing. Do not add test-runner imports to `packages/express-mock-core/src/`.

## Changesets

For each user-facing change, run `pnpm changeset` from the root and follow the prompts.
Include the generated Markdown file from `.changeset/` with your pull request, and describe
the change from a user's point of view.

The three packages are a [Changesets fixed group](.changeset/config.json): `express-mock-core`,
`jest-express` and `vitest-express` always release together with the same version. A change
to one package therefore advances the whole group at release time. Documentation-only
changes do not need a changeset unless they accompany a user-facing package change.

## Releasing

The maintainer handles releases. The release bot collects changesets into a release PR
against `master`; merging that PR builds and publishes all three packages to npm using
trusted publishing (OIDC) with provenance.

One-time maintainer setup (before merging the first release PR):

- [ ] In each package's npm settings, configure a GitHub Actions trusted publisher for owner
  `jest-express`, repository `jest-express`, workflow `release.yml`, with direct publishing
  allowed. See [npm's trusted publishing guide](https://docs.npmjs.com/trusted-publishers/).
- [ ] In GitHub repository settings under Actions > General, allow GitHub Actions to create
  and approve pull requests so the release bot can open its PR.
- [ ] Delete the old `NODE_AUTH_TOKEN` repository secret after configuring trusted
  publishing. The release workflow needs only the built-in `GITHUB_TOKEN` for its release PR.
