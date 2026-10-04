/** Size of an image URL: thumbnail, gallery stage, preview. */
export type NgmImageSize = 'small' | 'medium' | 'big';

/** Kind of media an item holds. */
export type NgmMediaType = 'image' | 'video';

/** Where the thumbnails sit. */
export type NgmGalleryLayout = 'thumbnails-bottom' | 'thumbnails-top';

/** How an image fills its box. */
export type NgmGalleryImageSize = 'cover' | 'contain';

/** Transition between images on the gallery stage. */
export type NgmGalleryAnimation = 'fade' | 'slide' | 'rotate' | 'zoom';

/**
 * Order of thumbnails on several rows: `column` fills each column top to bottom, `row` fills each row left to
 * right across all columns, `page` fills one page (columns x rows) row by row before the next page.
 */
export type NgmGalleryOrder = 'column' | 'row' | 'page';

/** One picture or video. */
export interface NgmGalleryItem {
  /** Thumbnail URL (falls back to `medium`, then `big`). */
  small?: string;
  /** Gallery stage URL (falls back to `big`, then `small`). */
  medium?: string;
  /** Preview URL (falls back to `medium`, then `small`). */
  big?: string;
  /** `image` or `video`; when left out it is taken from `mimeType`, then from the URL extension. */
  type?: NgmMediaType;
  /** MIME type, for example `video/mp4`. */
  mimeType?: string;
  /** Picture shown for a video before it plays; without it the first frame of the video is used. */
  poster?: string;
  /** Caption. HTML is allowed and sanitized by Angular. */
  description?: string;
  /** Text alternative of the picture; defaults to the label, then to an empty string. */
  alt?: string;
  /** Short name of the item (used in labels for screen readers and as a fallback alt). */
  label?: string;
  /** Link opened by a click on the image or its thumbnail (see `thumbnailsAsLinks`, `linkTarget`). */
  url?: string;
  /** Your own key (for example a file id), handy in a `resolver` or a `downloadHandler`. */
  id?: string | number;
}

/** A button on the image, a thumbnail or the preview bar. */
export interface NgmGalleryAction {
  /** Icon: CSS class(es) of an icon font, for example `bx bx-share`. */
  icon: string;
  /** Accessible name and tooltip. */
  titleText: string;
  disabled?: boolean;
  onClick: (event: Event, index: number) => void;
}

/** Function that returns the URL of an item at a size (sync or async, for example a signed URL). */
export type NgmUrlResolver = (
  item: NgmGalleryItem,
  size: NgmImageSize,
) => string | null | undefined | Promise<string | null | undefined>;

/** Function that downloads an item (for example through your API, so the download is counted). */
export type NgmDownloadHandler = (item: NgmGalleryItem, index: number) => void | Promise<void>;

/**
 * Gallery options. The names and defaults follow ngx-gallery, so its examples carry over; the extensions are
 * marked. Pass one object, or an array where entries with `breakpoint` apply at that window width and below.
 */
export interface NgmGalleryOptions {
  /** Width of the gallery, CSS value. Default `500px`. */
  width?: string;
  /** Height of the gallery, CSS value. Default `400px`. Ignored when `aspectRatio` is set. */
  height?: string;
  /** Extension: CSS aspect ratio of the whole gallery, for example `16 / 9`; the height then follows the width. */
  aspectRatio?: string;
  /** Window width in px at or below which this entry applies. */
  breakpoint?: number;
  /** Stretch the gallery to the full window width. */
  fullWidth?: boolean;
  layout?: NgmGalleryLayout;
  /** Item shown first. */
  startIndex?: number;
  /** Target of item links. Default `_blank`. */
  linkTarget?: string;
  /** Load only the shown item and its neighbours. Default true. */
  lazyLoading?: boolean;

  /** Show the stage. Default true. */
  image?: boolean;
  /** Share of the height for the stage, in %. Default 75. */
  imagePercent?: number;
  imageArrows?: boolean;
  /** Show the stage arrows only while the pointer is over the stage. */
  imageArrowsAutoHide?: boolean;
  imageSwipe?: boolean;
  imageAnimation?: NgmGalleryAnimation;
  imageSize?: NgmGalleryImageSize;
  imageAutoPlay?: boolean;
  /** Milliseconds between images. Default 2000. */
  imageAutoPlayInterval?: number;
  imageAutoPlayPauseOnHover?: boolean;
  /** After the last item comes the first, and before the first the last. */
  imageInfinityMove?: boolean;
  imageActions?: NgmGalleryAction[];
  imageDescription?: boolean;
  imageBullets?: boolean;
  /** Extension: "3 / 8" counter on the stage. */
  imageCounter?: boolean;
  /** Extension: visible button on the stage that opens the preview (a click on a picture opens it anyway). */
  imagePreviewButton?: boolean;

  /** Show the thumbnails. Default true. */
  thumbnails?: boolean;
  thumbnailsColumns?: number;
  thumbnailsRows?: number;
  /** Share of the height for the thumbnails, in %. Default 25. */
  thumbnailsPercent?: number;
  /** Space between stage and thumbnails, px. Default 10. */
  thumbnailsMargin?: number;
  thumbnailsArrows?: boolean;
  thumbnailsArrowsAutoHide?: boolean;
  thumbnailsSwipe?: boolean;
  /** Columns moved by one arrow click. Default 1. */
  thumbnailsMoveSize?: number;
  thumbnailsOrder?: NgmGalleryOrder;
  /** Show "+N" on the last thumbnail when more items follow. */
  thumbnailsRemainingCount?: boolean;
  /** Thumbnails are links to the item `url`. */
  thumbnailsAsLinks?: boolean;
  /** Hide the thumbnails when there is only one item. */
  thumbnailsAutoHide?: boolean;
  /** Space between thumbnails, px. Default 10. */
  thumbnailMargin?: number;
  thumbnailSize?: NgmGalleryImageSize;
  thumbnailActions?: NgmGalleryAction[];

  /** Open the preview on a click on the stage (or a thumbnail without stage). Default true. */
  preview?: boolean;
  previewDescription?: boolean;
  previewArrows?: boolean;
  previewArrowsAutoHide?: boolean;
  previewSwipe?: boolean;
  /** Show the full screen button in the preview. */
  previewFullscreen?: boolean;
  /** Enter browser full screen when the preview opens. */
  previewForceFullscreen?: boolean;
  /** Close the preview on a click outside the image. */
  previewCloseOnClick?: boolean;
  /** Close the preview with Escape. Default true (ngx-gallery: false). */
  previewCloseOnEsc?: boolean;
  /** Arrow keys move between items in the preview (and +, -, 0 zoom). */
  previewKeyboardNavigation?: boolean;
  previewAnimation?: boolean;
  previewAutoPlay?: boolean;
  previewAutoPlayInterval?: number;
  previewAutoPlayPauseOnHover?: boolean;
  previewInfinityMove?: boolean;
  /** Zoom buttons, mouse wheel and double click in the preview; drag moves a zoomed image. */
  previewZoom?: boolean;
  previewZoomStep?: number;
  previewZoomMax?: number;
  previewZoomMin?: number;
  previewRotate?: boolean;
  previewDownload?: boolean;
  /** Called instead of opening the built-in preview. */
  previewCustom?: (index: number) => void;
  previewBullets?: boolean;
  /** Extension: thumbnail strip at the foot of the preview. */
  previewThumbnails?: boolean;
  /** Extension: "3 / 8" counter in the preview bar. */
  previewCounter?: boolean;

  /** Extension: videos play on the stage (false: a click opens the preview). Default true. */
  videoInlinePlay?: boolean;
  /** Extension: start videos muted. */
  videoMuted?: boolean;
  /** Extension: play videos in a loop. */
  videoLoop?: boolean;
  /** Extension: how downloads are done; default a browser download of the `big` URL. */
  downloadHandler?: NgmDownloadHandler;

  /** Icon classes (icon font). Built-in icons are used when left out. */
  arrowPrevIcon?: string;
  arrowNextIcon?: string;
  closeIcon?: string;
  fullscreenIcon?: string;
  spinnerIcon?: string;
  zoomInIcon?: string;
  zoomOutIcon?: string;
  rotateLeftIcon?: string;
  rotateRightIcon?: string;
  downloadIcon?: string;
  /** Extension: play button icon. */
  playIcon?: string;
  /** Buttons in the preview bar. */
  actions?: NgmGalleryAction[];
}

/** Options with every value filled in. */
export type NgmResolvedOptions = Required<
  Omit<
    NgmGalleryOptions,
    | 'breakpoint'
    | 'aspectRatio'
    | 'previewCustom'
    | 'downloadHandler'
    | 'arrowPrevIcon'
    | 'arrowNextIcon'
    | 'closeIcon'
    | 'fullscreenIcon'
    | 'spinnerIcon'
    | 'zoomInIcon'
    | 'zoomOutIcon'
    | 'rotateLeftIcon'
    | 'rotateRightIcon'
    | 'downloadIcon'
    | 'playIcon'
  >
> &
  Pick<
    NgmGalleryOptions,
    | 'aspectRatio'
    | 'previewCustom'
    | 'downloadHandler'
    | 'arrowPrevIcon'
    | 'arrowNextIcon'
    | 'closeIcon'
    | 'fullscreenIcon'
    | 'spinnerIcon'
    | 'zoomInIcon'
    | 'zoomOutIcon'
    | 'rotateLeftIcon'
    | 'rotateRightIcon'
    | 'downloadIcon'
    | 'playIcon'
  >;

/** Defaults: those of ngx-gallery, plus the extensions. */
export const NGM_DEFAULT_OPTIONS: NgmResolvedOptions = {
  width: '500px',
  height: '400px',
  fullWidth: false,
  layout: 'thumbnails-bottom',
  startIndex: 0,
  linkTarget: '_blank',
  lazyLoading: true,
  image: true,
  imagePercent: 75,
  imageArrows: true,
  imageArrowsAutoHide: false,
  imageSwipe: false,
  imageAnimation: 'fade',
  imageSize: 'cover',
  imageAutoPlay: false,
  imageAutoPlayInterval: 2000,
  imageAutoPlayPauseOnHover: false,
  imageInfinityMove: false,
  imageActions: [],
  imageDescription: false,
  imageBullets: false,
  imageCounter: false,
  imagePreviewButton: false,
  thumbnails: true,
  thumbnailsColumns: 4,
  thumbnailsRows: 1,
  thumbnailsPercent: 25,
  thumbnailsMargin: 10,
  thumbnailsArrows: true,
  thumbnailsArrowsAutoHide: false,
  thumbnailsSwipe: false,
  thumbnailsMoveSize: 1,
  thumbnailsOrder: 'column',
  thumbnailsRemainingCount: false,
  thumbnailsAsLinks: false,
  thumbnailsAutoHide: false,
  thumbnailMargin: 10,
  thumbnailSize: 'cover',
  thumbnailActions: [],
  preview: true,
  previewDescription: true,
  previewArrows: true,
  previewArrowsAutoHide: false,
  previewSwipe: false,
  previewFullscreen: false,
  previewForceFullscreen: false,
  previewCloseOnClick: false,
  previewCloseOnEsc: true,
  previewKeyboardNavigation: false,
  previewAnimation: true,
  previewAutoPlay: false,
  previewAutoPlayInterval: 2000,
  previewAutoPlayPauseOnHover: false,
  previewInfinityMove: false,
  previewZoom: false,
  previewZoomStep: 0.1,
  previewZoomMax: 2,
  previewZoomMin: 0.5,
  previewRotate: false,
  previewDownload: false,
  previewBullets: false,
  previewThumbnails: false,
  previewCounter: false,
  videoInlinePlay: true,
  videoMuted: false,
  videoLoop: false,
  actions: [],
};

/** Texts read by people and screen readers. `{n}`, `{total}` and `{count}` are replaced. */
export interface NgmGalleryLabels {
  gallery: string;
  preview: string;
  previous: string;
  next: string;
  close: string;
  fullscreen: string;
  exitFullscreen: string;
  zoomIn: string;
  zoomOut: string;
  rotateLeft: string;
  rotateRight: string;
  download: string;
  play: string;
  loading: string;
  loadFailed: string;
  cannotPlay: string;
  counter: string;
  show: string;
  remaining: string;
  moreThumbnails: string;
  previousThumbnails: string;
}

export const NGM_DEFAULT_LABELS: NgmGalleryLabels = {
  gallery: 'Gallery, {total} items',
  preview: 'Preview',
  previous: 'Previous',
  next: 'Next',
  close: 'Close',
  fullscreen: 'Full screen',
  exitFullscreen: 'Exit full screen',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  download: 'Download',
  play: 'Play',
  loading: 'Loading',
  loadFailed: 'This file cannot be shown.',
  cannotPlay: 'This video cannot be played in your browser.',
  counter: '{n} / {total}',
  show: 'Show {n} of {total}',
  remaining: '+{count}',
  moreThumbnails: 'Next thumbnails',
  previousThumbnails: 'Previous thumbnails',
};

/** Event of a change of the shown item. */
export interface NgmGalleryChange {
  index: number;
  item: NgmGalleryItem;
}
