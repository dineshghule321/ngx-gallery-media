# ngx-gallery-media (repository)

Angular picture and video gallery published to npm as `ngx-gallery-media`, with a demo app of every variant.
Package readme: [projects/ngx-gallery-media/README.md](projects/ngx-gallery-media/README.md).

## Where it lives

| What               | Where                                               |
| ------------------ | --------------------------------------------------- |
| Package on npm     | https://www.npmjs.com/package/ngx-gallery-media     |
| Source (this repo) | https://github.com/dineshghule321/ngx-gallery-media |
| How to release     | [docs/RELEASING.md](docs/RELEASING.md)              |

Every change to the package is made here and reaches apps only as a new npm version. Apps never patch or copy the
package code; they keep a thin wrapper and move to the new version with
`npm install ngx-gallery-media@<version> --save-exact`.

## Layout

| Path                         | What                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `projects/ngx-gallery-media` | The library (ng-packagr). Public API in `src/public-api.ts`.                   |
| `projects/demo`              | Demo app: every example, theme (blue / orange), dark mode, English / Japanese. |
| `docs/USAGE.md`              | How to use each variant, all options, theming, accessibility.                  |
| `docs/RELEASING.md`          | Step by step: setup, first release, every release, fixing npm errors.          |
| `docs/CODE-MANAGEMENT.md`    | Branches, versions, releases, publishing, updating the apps.                   |
| `CHANGELOG.md`               | Changes per version.                                                           |
| `AGENTS.md`                  | Rules for coding agents and contributors.                                      |

## Commands

Node 22.17 (`.nvmrc`).

| Command                 | Does                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `npm ci`                | Install.                                                                            |
| `npm start`             | Demo at http://localhost:4300, reloading on library changes.                        |
| `npm test`              | Library tests in watch mode.                                                        |
| `npm run check`         | Lint, format check, library and demo tests, library and demo builds (what CI runs). |
| `npm run build`         | Library to `dist/ngx-gallery-media`.                                                |
| `npm run pack`          | Library build plus `npm pack` (a `.tgz` to try in an app).                          |
| `npm run format`        | Prettier on the sources and docs.                                                   |
| `npm run version:patch` | Next version (also `version:minor`, `version:major`) and changelog heading.         |
| `npm run release`       | Publish from your computer: login check, full check, `npm publish`.                 |

Tests need Chrome or Chromium; set `CHROME_BIN` when it is not found (the `ChromeHeadlessCI` launcher runs without
the sandbox, for containers).

## Rules

- Standalone components, `OnPush`, signals (`input`, `output`, `computed`, `effect`), `@if` / `@for`.
- No dependency besides Angular in the package. Demo-only tools stay in `devDependencies`.
- Every text through `labels`; every colour through a `--ngm-*` variable with a Bootstrap fallback.
- New options keep the ngx-gallery name when it has one; extensions are marked in `models.ts` and the docs.
- A change to the public API updates `docs/USAGE.md`, the demo and `CHANGELOG.md` in the same pull request.
- Conventional commits; releases by tag (see `docs/CODE-MANAGEMENT.md`).
