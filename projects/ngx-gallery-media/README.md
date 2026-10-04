# ngx-gallery-media

Picture and video gallery for Angular 20 and 21: a stage, thumbnails and a full-window preview. It takes the options
and defaults of [ngx-gallery](https://github.com/lukasz-galka/ngx-gallery), so its examples carry over, and adds
videos, signed URLs, translations, a preview service and theming through CSS variables.

- Standalone components, signals, OnPush; with or without Zone.js.
- No dependencies besides Angular. No HammerJS, no animations module, no global CSS.
- Follows Bootstrap 5 colours, radius and dark mode on its own.
- Keyboard, screen reader and reduced-motion friendly.

## Install

```bash
npm install ngx-gallery-media
```

## Use

```ts
import { NgmGalleryComponent, NgmGalleryItem, NgmGalleryOptions } from 'ngx-gallery-media';

@Component({
  selector: 'app-pictures',
  imports: [NgmGalleryComponent],
  template: `<ngm-gallery [images]="items" [options]="options" />`,
})
export class PicturesComponent {
  readonly items: NgmGalleryItem[] = [
    { small: 'a-320.jpg', medium: 'a-960.jpg', big: 'a-1600.jpg', label: 'Spindle' },
    { big: 'clip.mp4', mimeType: 'video/mp4', label: 'Cutting video' },
  ];
  readonly options: NgmGalleryOptions[] = [
    { width: '100%', height: '420px', previewZoom: true, previewRotate: true, previewKeyboardNavigation: true },
    { breakpoint: 576, height: '260px', thumbnailsColumns: 3 },
  ];
}
```

## What it does

| Area        | Features                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Stage       | Arrows (auto hide), swipe, auto play (pause on hover), fade / slide / rotate / zoom, cover or contain, captions, bullets, counter, actions, infinity move, links |
| Thumbnails  | Columns and rows, column / row / page order, move size, arrows (auto hide), swipe, "+N" remaining count, links, actions, top or bottom |
| Preview     | Full screen (button or at once), zoom (buttons, wheel, double click, pan), rotate, download, keyboard, swipe, auto play, captions, bullets, thumbnails, counter, close on Escape or click |
| Video       | Plays on the stage or in the preview, poster or first frame, muted, loop, "cannot play" state with download   |
| Integration | Async URL resolver (signed URLs), download handler, translations, breakpoints, aspect ratio, preview service, public API and events |

Full guide with every variant: [docs/USAGE.md](docs/USAGE.md). Licence: MIT.
