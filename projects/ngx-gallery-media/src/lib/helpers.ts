import {
  NGM_DEFAULT_LABELS,
  NGM_DEFAULT_OPTIONS,
  NgmGalleryItem,
  NgmGalleryLabels,
  NgmGalleryOptions,
  NgmGalleryOrder,
  NgmImageSize,
  NgmMediaType,
  NgmResolvedOptions,
} from './models';

const VIDEO_EXT = /\.(mp4|m4v|webm|ogv|ogg|mov)(\?|#|$)/i;

/**
 * Options for a window width: the entry without `breakpoint` first, then every entry whose breakpoint is at or
 * above the width, widest first, so the narrowest matching breakpoint wins.
 */
export function resolveOptions(
  options: NgmGalleryOptions | NgmGalleryOptions[] | null | undefined,
  windowWidth: number,
): NgmResolvedOptions {
  const list = Array.isArray(options) ? options : options ? [options] : [];
  const base = list.filter((o) => o.breakpoint === undefined);
  const matching = list
    .filter((o) => o.breakpoint !== undefined && windowWidth <= (o.breakpoint as number))
    .sort((a, b) => (b.breakpoint as number) - (a.breakpoint as number));
  const merged = Object.assign({}, NGM_DEFAULT_OPTIONS, ...base, ...matching) as NgmResolvedOptions & {
    breakpoint?: number;
  };
  delete merged.breakpoint;
  return merged;
}

/** Labels with the defaults for anything left out. */
export function resolveLabels(labels: Partial<NgmGalleryLabels> | null | undefined): NgmGalleryLabels {
  return { ...NGM_DEFAULT_LABELS, ...(labels ?? {}) };
}

/** Fills `{name}` placeholders. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (all, key: string) => (key in values ? String(values[key]) : all));
}

/** Image or video, from `type`, then `mimeType`, then the URL extension. */
export function mediaType(item: NgmGalleryItem): NgmMediaType {
  if (item.type) return item.type;
  if (item.mimeType) return item.mimeType.toLowerCase().startsWith('video/') ? 'video' : 'image';
  const url = item.big ?? item.medium ?? item.small ?? '';
  return VIDEO_EXT.test(url) ? 'video' : 'image';
}

export function isVideo(item: NgmGalleryItem | null | undefined): boolean {
  return !!item && mediaType(item) === 'video';
}

/** URL of an item at a size, with the fallbacks of ngx-gallery. */
export function defaultUrl(item: NgmGalleryItem, size: NgmImageSize): string | null {
  const order: Record<NgmImageSize, (keyof NgmGalleryItem)[]> = {
    small: ['small', 'medium', 'big'],
    medium: ['medium', 'big', 'small'],
    big: ['big', 'medium', 'small'],
  };
  for (const key of order[size]) {
    const v = item[key];
    if (typeof v === 'string' && v) return v;
  }
  return null;
}

/** Index after a step; wraps when `infinite`, else stays inside 0..count-1. */
export function stepIndex(index: number, step: number, count: number, infinite: boolean): number {
  if (count <= 0) return 0;
  const next = index + step;
  if (infinite) return ((next % count) + count) % count;
  return Math.min(Math.max(next, 0), count - 1);
}

/** Next zoom level, rounded to two decimals and kept between min and max. */
export function nextZoom(zoom: number, step: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round((zoom + step) * 100) / 100));
}

/** Column and row of a thumbnail, and the number of columns of all thumbnails. */
export interface ThumbnailPlace {
  col: number;
  row: number;
}

/** Number of thumbnail columns needed for `count` items. */
export function thumbnailColumns(count: number, columns: number, rows: number, order: NgmGalleryOrder): number {
  if (count <= 0) return 0;
  const r = Math.max(1, rows);
  if (order === 'page') {
    const perPage = Math.max(1, columns) * r;
    const pages = Math.ceil(count / perPage);
    const last = count - (pages - 1) * perPage;
    return (pages - 1) * columns + Math.min(columns, last);
  }
  return Math.ceil(count / r);
}

/** Where thumbnail `index` sits. */
export function thumbnailPlace(
  index: number,
  count: number,
  columns: number,
  rows: number,
  order: NgmGalleryOrder,
): ThumbnailPlace {
  const r = Math.max(1, rows);
  const c = Math.max(1, columns);
  if (order === 'row') {
    const total = Math.ceil(count / r);
    return { col: index % total, row: Math.floor(index / total) };
  }
  if (order === 'page') {
    const perPage = c * r;
    const page = Math.floor(index / perPage);
    const inPage = index % perPage;
    return { col: page * c + (inPage % c), row: Math.floor(inPage / c) };
  }
  return { col: Math.floor(index / r), row: index % r };
}

/** Left-most visible column so that column `col` is in view. */
export function scrollToColumn(left: number, col: number, visible: number, total: number): number {
  const max = Math.max(0, total - visible);
  let next = left;
  if (col < left) next = col;
  else if (col >= left + visible) next = col - visible + 1;
  return Math.min(Math.max(next, 0), max);
}

/** Horizontal swipe direction: 1 = next (swiped left), -1 = previous, 0 = no swipe. */
export function swipeDirection(dx: number, dy: number, threshold = 50): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}

/** Whether the visitor asked for less motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
