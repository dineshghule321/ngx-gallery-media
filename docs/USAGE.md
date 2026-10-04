# Using ngx-gallery-media

Every variant of the gallery, with the options and template to copy. The same examples run in the demo app
(`npm start`, then http://localhost:4300), where you can switch theme, dark mode and language.

Contents:

1. [Install and set up](#1-install-and-set-up)
2. [Items](#2-items)
3. [Options and breakpoints](#3-options-and-breakpoints)
4. [The ngx-gallery variants](#4-the-ngx-gallery-variants)
5. [Videos](#5-videos)
6. [Extensions](#6-extensions)
7. [Public API and events](#7-public-api-and-events)
8. [Translations](#8-translations)
9. [Theming](#9-theming)
10. [Accessibility and keyboard](#10-accessibility-and-keyboard)
11. [All options](#11-all-options)
12. [Moving from ngx-gallery](#12-moving-from-ngx-gallery)
13. [Wrapping it in your app](#13-wrapping-it-in-your-app)

## 1. Install and set up

```bash
npm install ngx-gallery-media
```

Angular 20 or 21. No other dependency, no global styles, no animations module, no HammerJS. The components are
standalone; import what you use:

```ts
import { NgmGalleryComponent, NgmGalleryItem, NgmGalleryOptions } from 'ngx-gallery-media';

@Component({
  selector: 'app-pictures',
  imports: [NgmGalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngm-gallery [images]="items" [options]="options" />`,
})
export class PicturesComponent {
  readonly items: NgmGalleryItem[] = [
    { small: 'a-320.jpg', medium: 'a-960.jpg', big: 'a-1600.jpg', label: 'Spindle' },
    { small: 'b-320.jpg', medium: 'b-960.jpg', big: 'b-1600.jpg', label: 'Finished part' },
  ];
  readonly options: NgmGalleryOptions[] = [
    { width: '100%', height: '400px' },
    { breakpoint: 576, height: '260px' },
  ];
}
```

The gallery works with and without Zone.js (it uses signals only).

## 2. Items

| Field         | Meaning                                                                               |
| ------------- | ------------------------------------------------------------------------------------- |
| `small`       | Thumbnail URL. Falls back to `medium`, then `big`.                                    |
| `medium`      | Stage URL. Falls back to `big`, then `small`.                                         |
| `big`         | Preview URL. Falls back to `medium`, then `small`.                                    |
| `type`        | `'image'` or `'video'`. When left out: from `mimeType`, then from the URL extension.  |
| `mimeType`    | For example `video/mp4`; also decides `type`.                                         |
| `poster`      | Picture of a video before it plays. Without it the first frame of the video is shown. |
| `description` | Caption. HTML is allowed and sanitized by Angular.                                    |
| `label`       | Short name: screen readers, the preview title, the fallback alt text.                 |
| `alt`         | Text alternative of the picture.                                                      |
| `url`         | Link opened by a click on the stage (and on the thumbnail with `thumbnailsAsLinks`).  |
| `id`          | Your key (a file id). Handy in a `resolver` or a `downloadHandler`.                   |

One URL is enough: `{ big: 'photo.jpg' }` is used at every size. Video extensions recognised without `type`:
mp4, m4v, webm, ogv, ogg, mov.

## 3. Options and breakpoints

`[options]` takes one object or an array. In an array, the entry without `breakpoint` holds the defaults; an
entry with `breakpoint: 576` applies when the window is 576 px wide or less. When several match, the narrowest
wins. The window width is read again on resize.

```ts
options: NgmGalleryOptions[] = [
  { width: '100%', height: '420px', thumbnailsColumns: 6 },
  { breakpoint: 768, thumbnailsColumns: 4 },
  { breakpoint: 576, height: '260px', thumbnailsColumns: 3 },
];
```

Size: `width` and `height` are CSS values (default `500px` by `400px`). `aspectRatio: '16 / 9'` sizes the gallery
by its width instead. `imagePercent` and `thumbnailsPercent` share the height between stage and thumbnails;
`thumbnailsMargin` is the space between them. `fullWidth: true` stretches the gallery to the window width.

## 4. The ngx-gallery variants

Every example of the ngx-gallery demo, with the same option names. The template is the same for all of them:

```html
<ngm-gallery [images]="images" [options]="options" />
```

### Simple gallery

```ts
options = [{ width: '100%', height: '400px' }];
```

### Custom layout

```ts
options = [{ imagePercent: 80, thumbnailsPercent: 20, thumbnailsColumns: 6, thumbnailsMargin: 0, thumbnailMargin: 0 }];
```

### Image size: contain

The whole picture is shown (default `cover` fills the stage and crops).

```ts
options = [{ imageSize: 'contain' }]; // thumbnails: thumbnailSize: 'contain'
```

### Thumbnails on several rows

```ts
options = [
  {
    thumbnailsColumns: 3,
    thumbnailsRows: 2,
    thumbnailsPercent: 40,
    imagePercent: 60,
    thumbnailMargin: 2,
    thumbnailsMargin: 2,
  },
];
```

Order of the thumbnails with `thumbnailsOrder`:

| Value      | Fills                                                     |
| ---------- | --------------------------------------------------------- |
| `'column'` | Each column top to bottom (default).                      |
| `'row'`    | Each row left to right across all columns.                |
| `'page'`   | One page (columns x rows) row by row, then the next page. |

```ts
options = [{ thumbnailsColumns: 3, thumbnailsRows: 2, thumbnailsOrder: 'page', thumbnailsMoveSize: 3 }];
```

### Move a whole thumbnails row

```ts
options = [{ thumbnailsMoveSize: 4 }];
```

### Thumbnails on top

```ts
options = [{ layout: 'thumbnails-top' }];
```

### Auto play

Pauses on hover when asked, while focus is inside the stage, while a video plays and while the tab is hidden.

```ts
options = [
  {
    imageAutoPlay: true,
    imageAutoPlayInterval: 3000,
    imageAutoPlayPauseOnHover: true,
    previewAutoPlay: true,
    previewAutoPlayPauseOnHover: true,
  },
];
```

### Image with description

```ts
images = [{ big: 'a.jpg', description: 'Finished part after <b>roughing</b>.' }];
options = [{ imageDescription: true }]; // the preview shows it by default (previewDescription)
```

### Preview with description and full screen

```ts
options = [{ previewFullscreen: true, previewKeyboardNavigation: true }];
```

### Preview in full screen at once

```ts
options = [{ previewFullscreen: true, previewForceFullscreen: true }];
```

### Preview closing on Escape and on a click

Escape closes by default here (`previewCloseOnEsc: true`); a click beside the picture closes with:

```ts
options = [{ previewCloseOnClick: true, previewCloseOnEsc: true }];
```

### Preview with zoom and rotate

Zoom with the buttons, the mouse wheel, a double click or `+` / `-` / `0` (with keyboard navigation); drag a
zoomed picture to move it.

```ts
options = [{ previewZoom: true, previewZoomStep: 0.25, previewZoomMin: 0.5, previewZoomMax: 4, previewRotate: true }];
```

### Only image

```ts
options = [{ thumbnails: false }, { breakpoint: 500, width: '100%', height: '200px' }];
```

### Only thumbnails

A thumbnail opens the preview.

```ts
options = [
  { image: false, height: '100px' },
  { breakpoint: 500, width: '100%' },
];
```

### Thumbnails with remaining count

The last visible thumbnail shows "+N"; the thumbnail arrows are not shown.

```ts
options = [
  { image: false, thumbnailsRemainingCount: true, height: '100px' },
  { breakpoint: 500, thumbnailsColumns: 2 },
];
```

### Swipe

Touch or mouse. A swipe never opens the preview or a link.

```ts
options = [
  { imageArrows: false, imageSwipe: true, thumbnailsArrows: false, thumbnailsSwipe: true, previewSwipe: true },
];
```

### Custom icons

Any icon font: give its classes. Built-in SVG icons are used for anything left out.

```ts
options = [
  {
    arrowPrevIcon: 'bx bx-chevron-left',
    arrowNextIcon: 'bx bx-chevron-right',
    closeIcon: 'bx bx-x',
    fullscreenIcon: 'bx bx-fullscreen',
    spinnerIcon: 'bx bx-loader-alt bx-spin',
    zoomInIcon: 'bx bx-zoom-in',
    zoomOutIcon: 'bx bx-zoom-out',
    rotateLeftIcon: 'bx bx-rotate-left',
    rotateRightIcon: 'bx bx-rotate-right',
    downloadIcon: 'bx bx-download',
    playIcon: 'bx bx-play-circle',
    previewFullscreen: true,
  },
];
```

### Arrows auto hide

```ts
options = [{ imageArrowsAutoHide: true, thumbnailsArrowsAutoHide: true, previewArrowsAutoHide: true }];
```

### Preview off

```ts
options = [{ preview: false }];
```

### The same picture several times

Items may repeat; each is its own slide.

### Animations

```ts
options = [{ imageAnimation: 'slide' }]; // 'fade' (default) | 'slide' | 'rotate' | 'zoom'
```

The speed comes from the CSS variable `--ngm-duration` (default `0.45s`). Visitors who ask for reduced motion get no
animation.

### Custom start index

```ts
options = [{ startIndex: 4 }];
```

### Buttons navigation

```html
<ngm-gallery #g [images]="images" [options]="{ imageArrows: false, thumbnailsArrows: false }" />
<button (click)="g.showPrev()" [disabled]="!g.canShowPrev()">Previous</button>
<button (click)="g.showNext()" [disabled]="!g.canShowNext()">Next</button>
```

### Only preview

```html
<ngm-gallery #g [images]="images" [options]="{ image: false, thumbnails: false, width: '0px', height: '0px' }" />
<button (click)="g.openPreview(0)">Open the preview</button>
```

For a preview without any gallery on the page, see [the preview service](#preview-without-a-gallery).

### Dynamic images change

The gallery follows the input. On a change the shown index stays (kept in range).

```ts
readonly images = signal<NgmGalleryItem[]>([...]);
add(item: NgmGalleryItem): void {
  this.images.update((list) => [...list, item]);
}
```

```html
<ngm-gallery [images]="images()" [options]="options" />
```

### Async images

```ts
readonly images = toSignal(this.api.pictures(), { initialValue: [] as NgmGalleryItem[] });
```

```html
@if (images().length) {
<ngm-gallery [images]="images()" [options]="options" (imagesReady)="onReady()" />
} @else {
<p>Loading…</p>
}
```

### Images as safe URLs

Not needed: URLs are bound as `[src]` and Angular treats them as safe image and media URLs. For URLs that must be
fetched first (signed links), use a [resolver](#signed-urls-async-resolver).

## 5. Videos

A video item shows its poster (or first frame) with a play button. With `videoInlinePlay` (default) it plays on
the stage with the browser controls; auto play waits while it plays and moving to another item pauses it. In the
preview it plays with controls.

```ts
images: NgmGalleryItem[] = [
  { big: 'clip.webm', type: 'video', label: 'Cutting video' },
  { big: 'clip.mp4', mimeType: 'video/mp4', poster: 'clip-poster.jpg', label: 'With a poster' },
  { small: 'a-320.jpg', big: 'a.jpg', label: 'A picture' },
];
options = [{ videoInlinePlay: true, videoMuted: false, videoLoop: false }];
```

| Option            | Default | Effect                                                            |
| ----------------- | ------- | ----------------------------------------------------------------- |
| `videoInlinePlay` | `true`  | Play on the stage. `false`: a click on a video opens the preview. |
| `videoMuted`      | `false` | Start muted.                                                      |
| `videoLoop`       | `false` | Play in a loop.                                                   |
| `playIcon`        |         | Icon class of the play button.                                    |

When the browser cannot play a file (unsupported format, missing file), the stage says so and the preview offers
the download (with `previewDownload`). Zoom and rotate apply to pictures only. MP4 (H.264) and WebM play in all
current browsers; other formats depend on the browser.

## 6. Extensions

### Signed URLs (async resolver)

Items can carry only an id. The resolver returns the URL of an item at a size, sync or as a promise. It is asked
once per item and size, only for items that are shown or next to the shown one (with `lazyLoading`, the default).

```ts
readonly resolver: NgmUrlResolver = (item, size) => this.files.previewUrl(item.id as string);
```

```html
<ngm-gallery [images]="items" [options]="options" [resolver]="resolver" />
```

A rejected promise or an empty URL shows the "cannot be shown" state for that item. When a URL stops working while
the page is open (a signed link that expired), the gallery asks the resolver once more; a different URL replaces the
old one, the same URL shows the error state. Cache links in the resolver until shortly before they expire.

### Downloads through your API

```ts
options = [
  {
    previewDownload: true,
    downloadHandler: (item, index) => this.files.download(item.id as string), // counted download
  },
];
```

Without a handler the browser downloads the `big` URL.

### Counter, bullets and a preview button on the stage

```ts
options = [{ imageCounter: true, imageBullets: true, imagePreviewButton: true }];
```

### Preview with thumbnails and counter

```ts
options = [{ previewThumbnails: true, previewCounter: true, previewBullets: false }];
```

### Custom actions

```ts
options = [
  {
    imageActions: [{ icon: 'bx bx-heart', titleText: 'Like', onClick: (event, index) => this.like(index) }],
    thumbnailActions: [{ icon: 'bx bx-trash', titleText: 'Remove', onClick: (event, index) => this.remove(index) }],
    actions: [{ icon: 'bx bx-share', titleText: 'Share', onClick: (event, index) => this.share(index) }], // preview bar
  },
];
```

`titleText` is the accessible name and tooltip; `disabled: true` greys a button out.

### Links

```ts
images = [{ big: 'a.jpg', url: 'https://example.com/a' }];
options = [{ thumbnailsAsLinks: true, linkTarget: '_blank' }];
```

### Infinity move

```ts
options = [{ imageInfinityMove: true, previewInfinityMove: true }];
```

### Responsive ratio

```ts
options = [
  { width: '100%', aspectRatio: '16 / 11', thumbnailsColumns: 6 },
  { breakpoint: 576, aspectRatio: '4 / 3', thumbnailsColumns: 4 },
];
```

### Preview without a gallery

Open the preview from any button, for example an "enlarge" button on a top picture:

```ts
private readonly preview = inject(NgmGalleryPreviewService);

enlarge(items: NgmGalleryItem[], index: number): void {
  const ref = this.preview.open(items, {
    index,
    options: { previewZoom: true, previewRotate: true, previewKeyboardNavigation: true },
    labels: this.labels,
    resolver: this.resolver,
    onChange: (i) => console.log('shown', i),
  });
  ref.closed.then((last) => console.log('closed at', last));
}
```

`ref.close()` closes it from code.

### `previewCustom`

Replace the built-in preview with your own:

```ts
options = [{ previewCustom: (index) => this.dialog.open(MyViewer, { data: index }) }];
```

### Lazy loading

On by default: the stage loads the shown item and its neighbours; the thumbnails load the visible page and one page
on each side. `lazyLoading: false` loads everything at once.

## 7. Public API and events

Get the component with a template reference (`#g`) or `viewChild(NgmGalleryComponent)`.

| Method                                                | Does                                          |
| ----------------------------------------------------- | --------------------------------------------- |
| `show(index)`                                         | Shows an item on the stage.                   |
| `showNext()`, `showPrev()`                            | Moves one item; returns false at an end.      |
| `canShowNext()`, `canShowPrev()`                      | Whether a move is possible.                   |
| `openPreview(index?)`                                 | Opens the preview (or calls `previewCustom`). |
| `closePreview()`                                      | Closes it.                                    |
| `moveThumbnailsRight()`, `moveThumbnailsLeft()`       | Moves the thumbnails by `thumbnailsMoveSize`. |
| `canMoveThumbnailsRight()`, `canMoveThumbnailsLeft()` | Whether they can move.                        |
| `index()`                                             | Signal of the shown index.                    |

| Event           | Payload           | When                                    |
| --------------- | ----------------- | --------------------------------------- |
| `imagesReady`   |                   | The items were set or changed.          |
| `change`        | `{ index, item }` | The shown item changed.                 |
| `previewOpen`   |                   | The preview opened.                     |
| `previewClose`  |                   | The preview closed (the stage follows). |
| `previewChange` | `{ index, item }` | The item in the preview changed.        |

## 8. Translations

All texts come from `[labels]`; English by default. `{n}`, `{total}` and `{count}` are filled in.

```ts
readonly labels = computed<Partial<NgmGalleryLabels>>(() => ({
  previous: this.t.instant('GALLERY.PREVIOUS'),
  next: this.t.instant('GALLERY.NEXT'),
  close: this.t.instant('GALLERY.CLOSE'),
  counter: '{n} / {total}',
  show: this.t.instant('GALLERY.SHOW'), // e.g. "Show {n} of {total}"
}));
```

```html
<ngm-gallery [images]="items" [options]="options" [labels]="labels()" />
```

Keys: `gallery`, `preview`, `previous`, `next`, `close`, `fullscreen`, `exitFullscreen`, `zoomIn`, `zoomOut`,
`rotateLeft`, `rotateRight`, `download`, `play`, `loading`, `loadFailed`, `cannotPlay`, `counter`, `show`,
`remaining`, `moreThumbnails`, `previousThumbnails`. A Japanese set is in the demo (`projects/demo/src/app/examples.ts`,
`LABELS_JA`).

## 9. Theming

The gallery reads CSS variables. Each falls back to the Bootstrap 5 variable of the page, so inside a Bootstrap app
it takes the app's primary colour, radius and light or dark colours without any setting.

| Variable                  | Falls back to                         | Used for                              |
| ------------------------- | ------------------------------------- | ------------------------------------- |
| `--ngm-accent`            | `--bs-primary`, then `#1565c0`        | Active thumbnail, focus rings         |
| `--ngm-stage-bg`          | `--bs-tertiary-bg`                    | Stage background (bands of `contain`) |
| `--ngm-thumb-bg`          | `--bs-tertiary-bg`                    | Thumbnail background                  |
| `--ngm-thumb-opacity`     | `0.7`                                 | Inactive thumbnails                   |
| `--ngm-thumb-arrow-color` | `--bs-body-color`                     | Thumbnail arrows                      |
| `--ngm-thumb-arrow-hover` | `rgba(0, 0, 0, 0.08)`                 | Thumbnail arrow hover                 |
| `--ngm-text`              | `--bs-body-color`                     | Text colour                           |
| `--ngm-radius`            | `--bs-border-radius`, then `0.375rem` | Corners                               |
| `--ngm-control-bg`        | `rgba(0, 0, 0, 0.5)`                  | Stage arrows and buttons              |
| `--ngm-control-bg-hover`  | `rgba(0, 0, 0, 0.75)`                 | Their hover                           |
| `--ngm-control-color`     | `#fff`                                | Their icons                           |
| `--ngm-focus`             | `#fff` or the accent                  | Focus outline                         |
| `--ngm-description-bg`    | `rgba(0, 0, 0, 0.6)`                  | Caption band on the stage             |
| `--ngm-description-color` | `#fff`                                | Caption text                          |
| `--ngm-bullet-color`      | `#fff`                                | Bullets                               |
| `--ngm-preview-bg`        | `#0e0e0e`                             | Preview background                    |
| `--ngm-preview-color`     | `#fff`                                | Preview text and icons                |
| `--ngm-preview-z`         | `10000`                               | Preview stacking order                |
| `--ngm-duration`          | `0.45s`                               | Animations                            |
| `--ngm-muted`             | `#6c757d`                             | Error and loading states              |

Examples:

```scss
// A Bootstrap app needs nothing: the gallery takes --bs-primary (for example #1565c0 or #ff5900).
// Another product:
.product-gallery {
  --ngm-accent: #0a7d5a;
  --ngm-radius: 0;
  --ngm-duration: 0.3s;
}
```

```html
<ngm-gallery class="product-gallery" [images]="items" />
```

Dark mode: with Bootstrap's `data-bs-theme="dark"`, the `--bs-*` variables change and the gallery follows.

## 10. Accessibility and keyboard

- Every control is a button with a name (from `labels`); thumbnails say "Show 3 of 8: <label>" and mark the current
  one with `aria-current`.
- The stage is a group with `aria-roledescription="carousel"`; hidden slides are `aria-hidden`.
- The preview is a modal dialog: focus moves to its close button, Tab stays inside, and focus returns to where it was
  on close. The page does not scroll behind it.
- Keys: stage `←` `→` (while focus is inside the stage); preview `Esc` closes, and with `previewKeyboardNavigation` `←` `→` move and `+`
  `-` `0` zoom.
- Reduced motion is respected (no slide, rotate or zoom animations).
- Give each item a `label` or `alt`.

## 11. All options

Defaults follow ngx-gallery; the differences are marked.

| Option                        | Default               | Meaning                                           |
| ----------------------------- | --------------------- | ------------------------------------------------- |
| `width`                       | `'500px'`             | Width (CSS).                                      |
| `height`                      | `'400px'`             | Height (CSS); ignored with `aspectRatio`.         |
| `aspectRatio`                 |                       | Extension. CSS ratio of the whole gallery.        |
| `breakpoint`                  |                       | Window width at or below which the entry applies. |
| `fullWidth`                   | `false`               | Full window width.                                |
| `layout`                      | `'thumbnails-bottom'` | Or `'thumbnails-top'`.                            |
| `startIndex`                  | `0`                   | First item shown.                                 |
| `linkTarget`                  | `'_blank'`            | Target of item links.                             |
| `lazyLoading`                 | `true`                | Load only what is shown and next to it.           |
| `image`                       | `true`                | Show the stage.                                   |
| `imagePercent`                | `75`                  | Stage share of the height (%).                    |
| `imageArrows`                 | `true`                | Stage arrows.                                     |
| `imageArrowsAutoHide`         | `false`               | Arrows only on hover or focus.                    |
| `imageSwipe`                  | `false`               | Swipe the stage.                                  |
| `imageAnimation`              | `'fade'`              | `'fade'`, `'slide'`, `'rotate'`, `'zoom'`.        |
| `imageSize`                   | `'cover'`             | Or `'contain'`.                                   |
| `imageAutoPlay`               | `false`               | Move on by itself.                                |
| `imageAutoPlayInterval`       | `2000`                | Milliseconds.                                     |
| `imageAutoPlayPauseOnHover`   | `false`               | Pause while the pointer is over the stage.        |
| `imageInfinityMove`           | `false`               | Wrap around.                                      |
| `imageActions`                | `[]`                  | Buttons on the stage.                             |
| `imageDescription`            | `false`               | Caption on the stage.                             |
| `imageBullets`                | `false`               | Bullets on the stage.                             |
| `imageCounter`                | `false`               | Extension. "3 / 8" on the stage.                  |
| `imagePreviewButton`          | `false`               | Extension. Button that opens the preview.         |
| `thumbnails`                  | `true`                | Show the thumbnails.                              |
| `thumbnailsColumns`           | `4`                   | Visible columns.                                  |
| `thumbnailsRows`              | `1`                   | Rows.                                             |
| `thumbnailsPercent`           | `25`                  | Thumbnails share of the height (%).               |
| `thumbnailsMargin`            | `10`                  | Space between stage and thumbnails (px).          |
| `thumbnailsArrows`            | `true`                | Thumbnail arrows.                                 |
| `thumbnailsArrowsAutoHide`    | `false`               | Arrows only on hover or focus.                    |
| `thumbnailsSwipe`             | `false`               | Swipe the thumbnails.                             |
| `thumbnailsMoveSize`          | `1`                   | Columns moved per arrow click.                    |
| `thumbnailsOrder`             | `'column'`            | `'column'`, `'row'`, `'page'`.                    |
| `thumbnailsRemainingCount`    | `false`               | "+N" on the last thumbnail.                       |
| `thumbnailsAsLinks`           | `false`               | Thumbnails link to the item `url`.                |
| `thumbnailsAutoHide`          | `false`               | Hide thumbnails when there is one item.           |
| `thumbnailMargin`             | `10`                  | Space between thumbnails (px).                    |
| `thumbnailSize`               | `'cover'`             | Or `'contain'`.                                   |
| `thumbnailActions`            | `[]`                  | Buttons on each thumbnail.                        |
| `preview`                     | `true`                | Open the preview on a click.                      |
| `previewDescription`          | `true`                | Caption in the preview.                           |
| `previewArrows`               | `true`                | Preview arrows.                                   |
| `previewArrowsAutoHide`       | `false`               | Arrows only on hover or focus.                    |
| `previewSwipe`                | `false`               | Swipe in the preview.                             |
| `previewFullscreen`           | `false`               | Full screen button.                               |
| `previewForceFullscreen`      | `false`               | Full screen at once.                              |
| `previewCloseOnClick`         | `false`               | Close on a click beside the picture.              |
| `previewCloseOnEsc`           | `true`                | Close with Escape. ngx-gallery: `false`.          |
| `previewKeyboardNavigation`   | `false`               | Arrow keys move; `+` `-` `0` zoom.                |
| `previewAnimation`            | `true`                | Fade between items.                               |
| `previewAutoPlay`             | `false`               | Move on by itself.                                |
| `previewAutoPlayInterval`     | `2000`                | Milliseconds.                                     |
| `previewAutoPlayPauseOnHover` | `false`               | Pause on hover.                                   |
| `previewInfinityMove`         | `false`               | Wrap around.                                      |
| `previewZoom`                 | `false`               | Zoom buttons, wheel, double click, pan.           |
| `previewZoomStep`             | `0.1`                 | Zoom step.                                        |
| `previewZoomMax`              | `2`                   | Largest zoom.                                     |
| `previewZoomMin`              | `0.5`                 | Smallest zoom.                                    |
| `previewRotate`               | `false`               | Rotate buttons (left and right).                  |
| `previewDownload`             | `false`               | Download button.                                  |
| `previewCustom`               |                       | Called instead of the built-in preview.           |
| `previewBullets`              | `false`               | Bullets in the preview.                           |
| `previewThumbnails`           | `false`               | Extension. Thumbnail strip in the preview.        |
| `previewCounter`              | `false`               | Extension. Counter in the preview bar.            |
| `videoInlinePlay`             | `true`                | Extension. Videos play on the stage.              |
| `videoMuted`                  | `false`               | Extension. Start muted.                           |
| `videoLoop`                   | `false`               | Extension. Loop.                                  |
| `downloadHandler`             |                       | Extension. Your download function.                |
| `actions`                     | `[]`                  | Buttons in the preview bar.                       |
| `arrowPrevIcon` … `playIcon`  |                       | Icon classes (see Custom icons).                  |

## 12. Moving from ngx-gallery

| ngx-gallery                                   | ngx-gallery-media                                   |
| --------------------------------------------- | --------------------------------------------------- |
| `NgxGalleryModule`, HammerJS                  | `imports: [NgmGalleryComponent]`, nothing else      |
| `<ngx-gallery [options] [images]>`            | `<ngm-gallery [options] [images]>`                  |
| `NgxGalleryImage { small, medium, big, ... }` | `NgmGalleryItem` (same fields, plus video and `id`) |
| `NgxGalleryAnimation.Slide`                   | `'slide'` (string unions instead of enums)          |
| `NgxGalleryImageSize.Contain`                 | `'contain'`                                         |
| `NgxGalleryLayout.ThumbnailsTop`              | `'thumbnails-top'`                                  |
| `NgxGalleryOrder.Row`                         | `'row'`                                             |
| Font Awesome icons by default                 | Built-in SVG icons; any font via the icon options   |
| `previewCloseOnEsc` default `false`           | Default `true`                                      |
| No video                                      | Videos, resolver, labels, themes, preview service   |

## 13. Wrapping it in your app

When several pages (or several apps) show galleries, wrap the package once in your app, so the pages keep a simple
component of their own and the settings live in one place:

- one options preset (`MY_GALLERY_OPTIONS`) for the whole app;
- a `resolver` that asks your API for short-lived file links, cached until shortly before they expire;
- a `downloadHandler` that calls your API, so downloads are counted or checked;
- `labels` from your translation files, recomputed when the language changes;
- a mapping from your file records to `NgmGalleryItem` (`id` = file id, `mimeType`, `label`, `description`).

```ts
export const MY_GALLERY_OPTIONS: NgmGalleryOptions[] = [
  {
    width: '100%',
    aspectRatio: '16 / 11',
    imageSize: 'contain',
    imageCounter: true,
    imagePreviewButton: true,
    previewZoom: true,
    previewRotate: true,
    previewKeyboardNavigation: true,
    previewThumbnails: true,
    previewDownload: true,
  },
  { breakpoint: 576, thumbnailsColumns: 4, aspectRatio: '4 / 3' },
];

@Component({
  selector: 'app-gallery',
  imports: [NgmGalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngm-gallery [images]="items()" [options]="options" [labels]="labels()" [resolver]="resolver" />`,
})
export class AppGalleryComponent {
  private readonly api = inject(FilesService);
  private readonly i18n = inject(MyTranslations);

  readonly files = input.required<MyFile[]>();
  readonly items = computed<NgmGalleryItem[]>(() =>
    this.files().map((f) => ({ id: f.id, mimeType: f.contentType, label: f.title ?? f.name, description: f.caption })),
  );
  readonly labels = computed(() => this.i18n.galleryLabels()); // Partial<NgmGalleryLabels>
  readonly options: NgmGalleryOptions[] = [
    { ...MY_GALLERY_OPTIONS[0], downloadHandler: (item) => this.api.download(String(item.id)) },
    ...MY_GALLERY_OPTIONS.slice(1),
  ];
  readonly resolver: NgmUrlResolver = (item) => this.api.previewUrl(String(item.id));
}
```

Do the same for the preview on its own: a small service in your app that calls `NgmGalleryPreviewService.open`
with the same preset, resolver, labels and download handler.
