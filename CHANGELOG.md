# Changelog

All notable changes to `ngx-gallery-media`. Versions follow [Semantic Versioning](https://semver.org/).

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
