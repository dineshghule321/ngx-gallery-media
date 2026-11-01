# Changelog

All notable changes to `ngx-gallery-media`. Versions follow [Semantic Versioning](https://semver.org/).

## Unreleased

- New option `protectMedia` (default `false`): read-only pictures and videos. No download button in the preview
  (even with `previewDownload`), no save menu (right click, long press) and no dragging out of pictures and videos
  on the stage, the thumbnails and the preview, and videos without their download and picture-in-picture buttons.
  Off by default, so existing galleries are unchanged.

## 1.1.1 (2026-10-31)

- Fix: the change animation of the stage (`imageAnimation`: fade, slide, rotate, zoom) never ran in an application.
  Angular scopes the `@keyframes` names of a component, and the names were given through CSS variables, which it
  does not rewrite. They are now named directly in `animation-name`. `--ngm-duration` works as documented.
- Fix: after a move, the picture that was shown no longer stays visible behind the new one (seen beside a narrower
  picture, for example portrait in a landscape stage with `imageSize: 'contain'`). It was never unmarked as
  leaving. It is now hidden when its change animation ends (2 s fallback), at once with reduced motion, and is
  visible only while an animation runs.

## 1.1.0 (2026-10-30)

- Angular 22 support: `@angular/core` and `@angular/common` peer range `^20.0.0 || ^21.0.0 || ^22.0.0`. The build
  stays on Angular 20 (the lowest supported version), so the package code is unchanged; checked in an Angular 22
  application (production build and unit tests).

## 1.0.1 (2026-10-29)

- Fix: a picture that fails to load without an error text (thumbnails) no longer shows an image role with an
  empty name (axe role-img-alt); the state is hidden from assistive technology, the button keeps the name.
- Development tools (Angular CLI and build, demo app) updated to the latest Angular 20 patch releases: `npm audit`
  reports 0 vulnerabilities. The published package is unchanged (only `tslib`, Angular as peer).

## 1.0.0 (2026-10-04)

First release.

- `ngm-gallery`: stage, thumbnails and preview with the options and defaults of ngx-gallery: layouts, image and
  thumbnail size, thumbnails on several rows (column, row and page order), move size, remaining count, links,
  auto hide, arrows (auto hide), swipe, auto play (pause on hover), descriptions, bullets, animations (fade, slide,
  rotate, zoom), infinity move, start index, breakpoints, lazy loading, custom actions and icons.
- Preview: full screen (button or at once), close on Escape or a click, keyboard, zoom (buttons, wheel, double click,
  pan), rotate both ways, download, auto play, swipe, bullets, description, `previewCustom`.
- Public API: `show`, `showNext`, `showPrev`, `canShowNext`, `canShowPrev`, `openPreview`, `closePreview`,
  `moveThumbnailsLeft`, `moveThumbnailsRight`, `canMoveThumbnailsLeft`, `canMoveThumbnailsRight`; events
  `imagesReady`, `change`, `previewOpen`, `previewClose`, `previewChange`.
- Extensions: videos (play on the stage or in the preview, poster or first frame, muted, loop, "cannot play"
  state), async URL `resolver` (signed URLs), `labels` (translations), `downloadHandler`, `aspectRatio`,
  `imageCounter`, `imagePreviewButton`, `previewThumbnails`, `previewCounter`, `NgmGalleryPreviewService`.
- A picture or video whose URL stopped working (an expired signed link) asks the resolver once for a fresh URL.
- Theming through CSS variables that fall back to Bootstrap 5 variables; light and dark.
- Accessible: buttons with names, focus kept inside the preview and returned on close, reduced motion respected.
- Standalone components with signals and OnPush; works with and without Zone.js; no dependencies besides Angular.
