# AGENTS.md: ngx-gallery-media

Instructions for coding agents (and humans in a hurry). Repository overview: `README.md`. Usage of every option:
`docs/USAGE.md`. Releases: `docs/RELEASING.md`. Branches and versions: `docs/CODE-MANAGEMENT.md`.

## Where it lives

- Package: https://www.npmjs.com/package/ngx-gallery-media (public, maintainer `dineshghule321`).
- Source: https://github.com/dineshghule321/ngx-gallery-media (private). This repository is the only place the
  package code is changed.
- Apps take it from npm by version. A fix requested from an app is made here, released, and the apps then run
  `npm install ngx-gallery-media@<version> --save-exact`. Never hand an app a patched copy.

## What this is

An Angular picture and video gallery (`<ngm-gallery>`, `NgmGalleryPreviewService`) with ngx-gallery option names,
plus a demo app of every variant. Angular 20 and 21 standalone, signals, zoneless-safe, no runtime dependency
besides Angular.

## Rules

1. Standalone components, `OnPush`, `inject()`, `input()` / `output()` / `computed()` / `effect()`, `@if` /
   `@for (track)`. No NgModules, no `any`.
2. No dependency besides Angular in the package. Demo-only tools stay in `devDependencies`, added only with the
   maintainer's approval.
3. No app or company specific code, names or texts. Every text through `labels`; every colour through a `--ngm-*`
   variable with a Bootstrap (`--bs-*`) fallback.
4. New options keep the ngx-gallery name when it has one; extensions are marked in `models.ts` and `docs/USAGE.md`.
5. A change to the public API (anything exported from `public-api.ts`) updates `docs/USAGE.md`, the demo, the tests
   and the `## Unreleased` section of `CHANGELOG.md` in the same pull request.
6. Accessibility: labels, `aria-*` on icon buttons, keyboard reachable, visible focus; works from 375 px wide.
7. Done means `npm run check` passes (lint, format, library and demo tests, library and demo builds).

## Releasing

Semantic versions: fix = patch, new option = minor, breaking = major. `npm run version:patch` (or `minor`,
`major`), commit, tag `v<version>`, push; the `Release` workflow publishes to npm. Never commit tokens or `.npmrc`.
Step by step: `docs/RELEASING.md`.

## Commits

Conventional commits, one concern each: `feat(gallery): ...`, `fix(preview): ...`, `docs: ...`, `test: ...`,
`chore(release): ...`. Never commit `dist/`, `coverage/` or secrets.
