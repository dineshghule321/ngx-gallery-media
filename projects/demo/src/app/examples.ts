import { NgmGalleryItem, NgmGalleryLabels, NgmGalleryOptions } from 'ngx-gallery-media';

/** One demo: a gallery with its options and the code to copy. */
export interface Example {
  id: string;
  title: string;
  text: string;
  images: NgmGalleryItem[];
  options: NgmGalleryOptions[];
  /** Special demos with their own controls. */
  kind?: 'buttons' | 'only-preview' | 'dynamic' | 'async' | 'service' | 'resolver';
  /** Code shown under the gallery; generated from the options when left out. */
  code?: string;
  /** Group in the menu. */
  group: 'ngx-gallery' | 'Video' | 'Extensions';
}

const DESCRIPTIONS = [
  'Spindle setup before the first cut.',
  'Finished part after <b>roughing</b> and finishing.',
  'Tool path seen from the top.',
  'Chips after machining.',
  'Measurement of the surface finish.',
  'Clamping of the workpiece.',
  'Coolant through the spindle.',
  'Team at the machine after the demo.',
];

export function image(i: number, description = false): NgmGalleryItem {
  return {
    small: `assets/img/${i}-small.jpg`,
    medium: `assets/img/${i}-medium.jpg`,
    big: `assets/img/${i}-big.jpg`,
    label: `Picture ${i}`,
    alt: `Sample picture ${i}`,
    description: description ? DESCRIPTIONS[i - 1] : undefined,
  };
}

export function images(description = false, order = [1, 2, 3, 4, 5, 6, 7, 8]): NgmGalleryItem[] {
  return order.map((i) => image(i, description));
}

export const VIDEO_WEBM: NgmGalleryItem = {
  big: 'assets/video/sample.webm',
  type: 'video',
  label: 'Cutting video (WebM)',
  description: 'Videos play on the stage; the preview shows a player with controls.',
};

export const VIDEO_MP4: NgmGalleryItem = {
  big: 'assets/video/sample.mp4',
  mimeType: 'video/mp4',
  poster: 'assets/video/sample-poster.jpg',
  label: 'Cutting video (MP4, with poster)',
  description: 'An MP4 with its own poster picture.',
};

export const VIDEO_BROKEN: NgmGalleryItem = {
  big: 'assets/video/missing.mov',
  type: 'video',
  label: 'Video the browser cannot play',
};

/** Japanese texts for the language switch. */
export const LABELS_JA: Partial<NgmGalleryLabels> = {
  gallery: 'ギャラリー（{total}件）',
  preview: 'プレビュー',
  previous: '前へ',
  next: '次へ',
  close: '閉じる',
  fullscreen: '全画面表示',
  exitFullscreen: '全画面表示を終了',
  zoomIn: '拡大',
  zoomOut: '縮小',
  rotateLeft: '左に回転',
  rotateRight: '右に回転',
  download: 'ダウンロード',
  play: '再生',
  loading: '読み込み中',
  loadFailed: 'このファイルは表示できません。',
  cannotPlay: 'このブラウザーではこの動画を再生できません。',
  counter: '{n} / {total}',
  show: '{total}件中{n}件目を表示',
  remaining: '+{count}',
  moreThumbnails: '次のサムネイル',
  previousThumbnails: '前のサムネイル',
};

const w = { width: '100%', height: '400px' };
const phone = { breakpoint: 576, height: '300px' };

export const EXAMPLES: Example[] = [
  {
    group: 'ngx-gallery',
    id: 'simple',
    title: 'Simple gallery',
    text: 'Stage, thumbnails and preview with the default options.',
    images: images(),
    options: [w, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'custom-layout',
    title: 'Custom layout',
    text: 'More room for the stage, six thumbnails and no margins.',
    images: images(),
    options: [
      { ...w, imagePercent: 80, thumbnailsPercent: 20, thumbnailsColumns: 6, thumbnailsMargin: 0, thumbnailMargin: 0 },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'image-size-contain',
    title: 'Image size: contain',
    text: 'The whole picture is shown, with bands where the ratio differs.',
    images: images(),
    options: [{ ...w, imageSize: 'contain' }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'thumbnails-rows',
    title: 'Thumbnails on several rows',
    text: 'Three columns, two rows; filled column by column.',
    images: images(),
    options: [
      {
        ...w,
        thumbnailsColumns: 3,
        thumbnailsRows: 2,
        thumbnailsPercent: 40,
        imagePercent: 60,
        thumbnailMargin: 2,
        thumbnailsMargin: 2,
      },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'thumbnails-rows-order',
    title: 'Several rows, ordered by row',
    text: 'The same grid filled row by row.',
    images: images(),
    options: [
      {
        ...w,
        thumbnailsColumns: 3,
        thumbnailsRows: 2,
        thumbnailsPercent: 40,
        imagePercent: 60,
        thumbnailMargin: 2,
        thumbnailsMargin: 2,
        thumbnailsOrder: 'row',
      },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'thumbnails-page-order',
    title: 'Several rows, ordered by page',
    text: 'Each page of three by two is filled row by row; the arrows move a whole page.',
    images: images(),
    options: [
      {
        ...w,
        thumbnailsColumns: 3,
        thumbnailsRows: 2,
        thumbnailsPercent: 40,
        imagePercent: 60,
        thumbnailMargin: 2,
        thumbnailsMargin: 2,
        thumbnailsOrder: 'page',
        thumbnailsMoveSize: 3,
      },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'move-whole-row',
    title: 'Move a whole thumbnails row',
    text: 'One arrow click moves four columns.',
    images: images(),
    options: [{ ...w, thumbnailsMoveSize: 4 }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'thumbnails-top',
    title: 'Thumbnails on top',
    text: 'Thumbnails above the stage.',
    images: images(),
    options: [{ ...w, layout: 'thumbnails-top' }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'auto-play',
    title: 'Auto play',
    text: 'The stage and the preview move on by themselves and pause while the pointer is over them.',
    images: images(),
    options: [
      {
        ...w,
        imageAutoPlay: true,
        imageAutoPlayPauseOnHover: true,
        previewAutoPlay: true,
        previewAutoPlayPauseOnHover: true,
        imageInfinityMove: true,
      },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'image-description',
    title: 'Image with description',
    text: 'The caption over the stage (HTML is allowed and sanitized).',
    images: images(true),
    options: [{ ...w, imageDescription: true }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'preview-fullscreen',
    title: 'Preview with description and full screen',
    text: 'Open the preview: caption, full screen button, arrow keys.',
    images: images(true),
    options: [{ ...w, previewFullscreen: true, previewKeyboardNavigation: true }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'preview-force-fullscreen',
    title: 'Preview in full screen at once',
    text: 'The preview enters browser full screen when it opens.',
    images: images(true),
    options: [{ ...w, previewFullscreen: true, previewForceFullscreen: true }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'preview-close',
    title: 'Preview closing on Escape and on a click',
    text: 'A click outside the picture or Escape closes the preview.',
    images: images(true),
    options: [{ ...w, previewCloseOnClick: true, previewCloseOnEsc: true }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'preview-zoom-rotate',
    title: 'Preview with zoom and rotate',
    text: 'Zoom with the buttons, the mouse wheel or a double click; drag a zoomed picture; rotate both ways.',
    images: images(true),
    options: [
      {
        ...w,
        previewZoom: true,
        previewZoomMax: 4,
        previewZoomStep: 0.25,
        previewRotate: true,
        previewKeyboardNavigation: true,
      },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'only-image',
    title: 'Only image',
    text: 'No thumbnails.',
    images: images(true),
    options: [
      { ...w, thumbnails: false },
      { breakpoint: 576, height: '220px' },
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'only-thumbnails',
    title: 'Only thumbnails',
    text: 'No stage; a thumbnail opens the preview.',
    images: images(true),
    options: [
      { width: '100%', height: '110px', image: false },
      { breakpoint: 576, thumbnailsColumns: 3 },
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'remaining-count',
    title: 'Thumbnails with remaining count',
    text: 'The last thumbnail tells how many more there are.',
    images: images(true),
    options: [
      { width: '100%', height: '110px', image: false, thumbnailsRemainingCount: true },
      { breakpoint: 576, thumbnailsColumns: 2 },
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'swipe',
    title: 'Swipe',
    text: 'No arrows: swipe the stage, the thumbnails and the preview (touch or mouse).',
    images: images(),
    options: [
      {
        ...w,
        imageArrows: false,
        imageSwipe: true,
        thumbnailsArrows: false,
        thumbnailsSwipe: true,
        previewSwipe: true,
      },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'custom-icons',
    title: 'Custom icons',
    text: 'Any icon font: give the classes (this demo uses a few CSS classes of its own).',
    images: images(),
    options: [
      {
        ...w,
        arrowPrevIcon: 'demo-icon demo-icon-prev',
        arrowNextIcon: 'demo-icon demo-icon-next',
        closeIcon: 'demo-icon demo-icon-close',
        fullscreenIcon: 'demo-icon demo-icon-full',
        previewFullscreen: true,
      },
      phone,
    ],
  },
  {
    group: 'ngx-gallery',
    id: 'arrows-auto-hide',
    title: 'Arrows auto hide',
    text: 'Arrows appear while the pointer is over the stage or the thumbnails.',
    images: images(),
    options: [{ ...w, imageArrowsAutoHide: true, thumbnailsArrowsAutoHide: true }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'disabled-preview',
    title: 'Preview off',
    text: 'A click on the stage does nothing.',
    images: images(),
    options: [{ ...w, preview: false }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'same-images',
    title: 'The same picture several times',
    text: 'Items can repeat.',
    images: [image(1), image(1), image(1)],
    options: [w, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'animation-slide',
    title: 'Animation: slide',
    text: 'The pictures slide in from the side of the move.',
    images: images(),
    options: [{ ...w, imageAnimation: 'slide' }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'animation-rotate',
    title: 'Animation: rotate',
    text: 'The new picture turns in.',
    images: images(),
    options: [{ ...w, imageAnimation: 'rotate' }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'animation-zoom',
    title: 'Animation: zoom',
    text: 'The new picture grows in, the old one grows out.',
    images: images(),
    options: [{ ...w, imageAnimation: 'zoom' }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'start-index',
    title: 'Custom start index',
    text: 'Starts at the fifth picture.',
    images: images(),
    options: [{ ...w, startIndex: 4 }, phone],
  },
  {
    group: 'ngx-gallery',
    id: 'buttons-navigation',
    title: 'Buttons navigation',
    text: 'Your own buttons call showPrev() and showNext().',
    images: images(),
    options: [{ ...w, imageArrows: false, thumbnailsArrows: false }, phone],
    kind: 'buttons',
    code: `<ngm-gallery #g [images]="images" [options]="options" />
<button (click)="g.showPrev()" [disabled]="!g.canShowPrev()">Previous</button>
<button (click)="g.showNext()" [disabled]="!g.canShowNext()">Next</button>

options = [{ width: '100%', height: '400px', imageArrows: false, thumbnailsArrows: false }];`,
  },
  {
    group: 'ngx-gallery',
    id: 'only-preview',
    title: 'Only preview',
    text: 'No stage and no thumbnails: a button opens the preview.',
    images: images(true),
    options: [{ image: false, thumbnails: false, width: '0px', height: '0px' }],
    kind: 'only-preview',
    code: `<ngm-gallery #g [images]="images" [options]="{ image: false, thumbnails: false, width: '0px', height: '0px' }" />
<button (click)="g.openPreview(0)">Open the preview</button>`,
  },
  {
    group: 'ngx-gallery',
    id: 'dynamic',
    title: 'Dynamic images change',
    text: 'Change, add or remove items; the gallery follows.',
    images: images(true, [1, 2, 3]),
    options: [w, phone],
    kind: 'dynamic',
    code: `readonly images = signal<NgmGalleryItem[]>([...]);
add(): void { this.images.update((list) => [...list, next]); }
remove(): void { this.images.update((list) => list.slice(0, -1)); }

<ngm-gallery [images]="images()" [options]="options" />`,
  },
  {
    group: 'ngx-gallery',
    id: 'async',
    title: 'Async images',
    text: 'Items arrive after a delay; show your own loading state until then.',
    images: [],
    options: [w, phone],
    kind: 'async',
    code: `readonly images = toSignal(this.api.pictures(), { initialValue: [] });

@if (images().length) {
  <ngm-gallery [images]="images()" [options]="options" />
} @else {
  <p>Loading…</p>
}`,
  },
  {
    group: 'Video',
    id: 'videos',
    title: 'Pictures and videos',
    text: 'Videos play on the stage with controls; the thumbnail shows the first frame or the poster. Auto play waits while a video plays.',
    images: [VIDEO_WEBM, ...images(true, [1, 2]), VIDEO_MP4, image(3, true)],
    options: [{ ...w, imageDescription: true, previewZoom: true, previewKeyboardNavigation: true }, phone],
  },
  {
    group: 'Video',
    id: 'video-preview-only',
    title: 'Videos in the preview only',
    text: 'videoInlinePlay: false. A click on a video opens the preview, which plays it.',
    images: [image(4), VIDEO_WEBM, image(5)],
    options: [{ ...w, videoInlinePlay: false, imagePreviewButton: true }, phone],
  },
  {
    group: 'Video',
    id: 'video-muted-loop',
    title: 'Muted video in a loop',
    text: 'videoMuted and videoLoop, for silent demo clips.',
    images: [VIDEO_WEBM, image(6)],
    options: [{ ...w, videoMuted: true, videoLoop: true, thumbnails: false, imageCounter: true }, phone],
  },
  {
    group: 'Video',
    id: 'video-cannot-play',
    title: 'A video the browser cannot play',
    text: 'The stage and the preview say so, and the preview offers the download.',
    images: [VIDEO_BROKEN, image(7)],
    options: [{ ...w, previewDownload: true }, phone],
  },
  {
    group: 'Extensions',
    id: 'counter-bullets',
    title: 'Counter, bullets and a preview button',
    text: 'imageCounter, imageBullets and imagePreviewButton on the stage.',
    images: images(),
    options: [{ ...w, imageCounter: true, imageBullets: true, imagePreviewButton: true, thumbnails: false }, phone],
  },
  {
    group: 'Extensions',
    id: 'preview-thumbnails',
    title: 'Preview with thumbnails and counter',
    text: 'previewThumbnails and previewCounter: a strip of thumbnails at the foot of the preview.',
    images: [...images(true, [1, 2, 3, 4]), VIDEO_WEBM, ...images(true, [5, 6])],
    options: [
      {
        ...w,
        previewThumbnails: true,
        previewCounter: true,
        previewZoom: true,
        previewRotate: true,
        previewFullscreen: true,
        previewKeyboardNavigation: true,
        previewDownload: true,
      },
      phone,
    ],
  },
  {
    group: 'Extensions',
    id: 'actions',
    title: 'Custom actions and download',
    text: 'Buttons of your own on the stage, the thumbnails and the preview bar; downloads go through your handler (for example a counted download).',
    images: images(),
    options: [],
    code: `options: NgmGalleryOptions[] = [{
  width: '100%',
  height: '400px',
  imageActions: [{ icon: 'demo-icon demo-icon-heart', titleText: 'Like', onClick: (e, i) => this.like(i) }],
  thumbnailActions: [{ icon: 'demo-icon demo-icon-close', titleText: 'Remove', onClick: (e, i) => this.remove(i) }],
  actions: [{ icon: 'demo-icon demo-icon-heart', titleText: 'Like', onClick: (e, i) => this.like(i) }],
  previewDownload: true,
  downloadHandler: (item, i) => this.api.download(item.id),
}];`,
  },
  {
    group: 'Extensions',
    id: 'links',
    title: 'Links',
    text: 'Items with a url open it from the stage; thumbnailsAsLinks makes the thumbnails links too.',
    images: images().map((m, i) => ({ ...m, url: `https://example.com/pictures/${i + 1}` })),
    options: [{ ...w, thumbnailsAsLinks: true, linkTarget: '_blank' }, phone],
  },
  {
    group: 'Extensions',
    id: 'infinity',
    title: 'Infinity move',
    text: 'After the last item comes the first, on the stage and in the preview.',
    images: images(),
    options: [{ ...w, imageInfinityMove: true, previewInfinityMove: true }, phone],
  },
  {
    group: 'Extensions',
    id: 'aspect-ratio',
    title: 'Responsive ratio and breakpoints',
    text: 'aspectRatio sizes the gallery by its width; breakpoints change columns on small screens.',
    images: images(),
    options: [
      { width: '100%', aspectRatio: '16 / 11', thumbnailsColumns: 6, imagePercent: 80, thumbnailsPercent: 20 },
      { breakpoint: 768, thumbnailsColumns: 4 },
      { breakpoint: 576, thumbnailsColumns: 3, imagePercent: 75, thumbnailsPercent: 25 },
    ],
  },
  {
    group: 'Extensions',
    id: 'resolver',
    title: 'Signed URLs (async resolver)',
    text: 'Items carry only an id; a resolver fetches each URL when needed (here after a short delay), once per size.',
    images: [1, 2, 3, 4, 5].map((i) => ({ id: i, label: `File ${i}` })),
    options: [{ ...w, imageCounter: true }, phone],
    kind: 'resolver',
    code: `resolver: NgmUrlResolver = (item, size) => this.files.previewUrl(item.id as string);

<ngm-gallery [images]="items" [options]="options" [resolver]="resolver" />`,
  },
  {
    group: 'Extensions',
    id: 'service',
    title: 'Preview without a gallery',
    text: 'NgmGalleryPreviewService opens the preview from any button, for example an "enlarge" button on a top picture.',
    images: images(true),
    options: [],
    kind: 'service',
    code: `private readonly preview = inject(NgmGalleryPreviewService);

enlarge(): void {
  this.preview.open(this.items, {
    index: 0,
    options: { previewZoom: true, previewRotate: true, previewKeyboardNavigation: true, previewCounter: true },
    labels: this.labels,
  });
}`,
  },
  {
    group: 'Extensions',
    id: 'full-preset',
    title: 'Full-featured preset',
    text: 'A complete setup for content pages: wide stage, counter, preview button, videos in place, full preview with thumbnails, zoom, rotate and download.',
    images: [...images(true, [1, 2, 3]), VIDEO_WEBM, ...images(true, [4, 5, 6])],
    options: [
      {
        width: '100%',
        aspectRatio: '16 / 11',
        imageSize: 'contain',
        imageCounter: true,
        imagePreviewButton: true,
        imageDescription: false,
        imageInfinityMove: true,
        imageSwipe: true,
        thumbnailsColumns: 6,
        thumbnailsSwipe: true,
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailMargin: 6,
        thumbnailsMargin: 8,
        previewZoom: true,
        previewZoomMax: 5,
        previewZoomStep: 0.5,
        previewRotate: true,
        previewFullscreen: true,
        previewKeyboardNavigation: true,
        previewSwipe: true,
        previewInfinityMove: true,
        previewThumbnails: true,
        previewCounter: true,
        previewDownload: true,
      },
      { breakpoint: 576, thumbnailsColumns: 4, aspectRatio: '4 / 3' },
    ],
  },
];

/** Code of an example from its options. */
export function codeOf(example: Example): string {
  if (example.code) return example.code;
  const options = JSON.stringify(example.options, null, 2)
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, "'");
  return `<ngm-gallery [images]="images" [options]="options" [labels]="labels" />\n\noptions: NgmGalleryOptions[] = ${options};`;
}
