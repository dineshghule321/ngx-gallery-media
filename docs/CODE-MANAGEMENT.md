# Code management, releases and publishing

How this repository is run, how a version reaches npm, and how apps take it.

## Decision

| Question             | Answer                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Where the code lives | Its own repository, `ngx-gallery-media`, separate from the apps that use it.                                     |
| What it holds        | The library (`projects/ngx-gallery-media`) and the demo app (`projects/demo`). No app-specific code.             |
| How apps get it      | From the public npm registry: `npm install ngx-gallery-media@^1`.                                                |
| Demo                 | Run locally (`npm start`). It can be put on GitHub Pages or any static host later; nothing in it needs a server. |
| App specifics        | A thin wrapper in each app (see USAGE.md, "Wrapping it in your app").                                            |

Why a package and not copied files: one source, one set of tests, a version number in each app, and the same fix
reaches every app by one version bump. The gallery holds no business logic, so it can be public; URLs, downloads
and texts come in from the apps.

## Releases

Step-by-step for the one-time setup, the first release (1.0.0) and every next release, with the fixes for npm
errors: [RELEASING.md](RELEASING.md).

## Branches and commits

- The repository is private on GitHub; `main` is always releasable; the `CI` workflow runs the full check on every
  push and pull request.
- Work on `feat/...`, `fix/...` branches; merge by pull request after the check passes.
- Conventional commits (`feat(gallery): ...`, `fix(preview): ...`, `docs: ...`), so the changelog writes itself
  and the next version is clear: `fix` = patch, `feat` = minor, `feat!` or `BREAKING CHANGE` = major.

## Versions

[Semantic Versioning](https://semver.org/). Public API = everything exported from `public-api.ts`: components,
inputs, outputs, options, labels, CSS variables, the preview service.

| Change                                                             | Version   |
| ------------------------------------------------------------------ | --------- |
| Bug fix, docs, internal change                                     | 1.0.**x** |
| New option, label, CSS variable or event (old use unchanged)       | 1.**x**.0 |
| Renamed or removed option, changed default, new Angular major only | **x**.0.0 |

Angular support: each major of the package states its Angular range in `peerDependencies`
(1.x: Angular 20 and 21).

## Releasing

`npm run release:prepare -- patch|minor|major` sets the version and dates the `## Unreleased` changelog entries; a
`v<version>` tag publishes through the `Release` workflow (npm trusted publishing, no token). Details and troubleshooting: [RELEASING.md](RELEASING.md).

## Working on the library and an app together

- `npm start` here: the demo reloads on every library change (it reads the source).
- To try a change inside an app before releasing: `npm run pack` here, then in the app
  `npm install ../ngx-gallery-media/dist/ngx-gallery-media/ngx-gallery-media-<version>.tgz`; undo with
  `git checkout package.json package-lock.json && npm ci`. Prefer this over `npm link`, which gives Angular two
  copies of its core.

## Updating the apps

1. In each app: `npm install ngx-gallery-media@<version>`; commit `package.json` and `package-lock.json`
   (`chore(deps): ngx-gallery-media <version>`).
2. Read the changelog; for a major, follow its notes.
3. Run the app checks and look at a gallery page and the preview at 1440 px and 375 px.
4. Apps that share pages or a design move to the same version together.

## Checks

`npm run check` = lint (angular-eslint, with accessibility rules) + Prettier + library and demo tests (Karma,
headless Chromium) + library build (ng-packagr, partial compilation) + demo production build. The library tests run
without Zone.js, so the package works in zoneless apps as well.

## Later

- Other generic UI parts (rich text view, multi-select, file uploader) can follow the same road once they hold no
  app logic. Parts tied to one product stay in its apps.
- A public demo site: build with `npm run build:demo` and serve `dist/demo/browser` from GitHub Pages or any static
  host.
