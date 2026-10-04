import {
  defaultUrl,
  fill,
  mediaType,
  nextZoom,
  resolveLabels,
  resolveOptions,
  scrollToColumn,
  stepIndex,
  swipeDirection,
  thumbnailColumns,
  thumbnailPlace,
} from './helpers';
import { NGM_DEFAULT_OPTIONS } from './models';

describe('resolveOptions', () => {
  it('starts from the ngx-gallery defaults', () => {
    const o = resolveOptions(null, 1200);
    expect(o.width).toBe('500px');
    expect(o.height).toBe('400px');
    expect(o.thumbnailsColumns).toBe(4);
    expect(o.imageAnimation).toBe('fade');
  });

  it('applies breakpoints at and below their width, the narrowest last', () => {
    const list = [
      { width: '800px', thumbnailsColumns: 6 },
      { breakpoint: 800, width: '100%', thumbnailsColumns: 4 },
      { breakpoint: 400, thumbnailsColumns: 2 },
    ];
    expect(resolveOptions(list, 1000).thumbnailsColumns).toBe(6);
    expect(resolveOptions(list, 800).width).toBe('100%');
    expect(resolveOptions(list, 800).thumbnailsColumns).toBe(4);
    expect(resolveOptions(list, 375).thumbnailsColumns).toBe(2);
    expect(resolveOptions(list, 375).width).toBe('100%');
    expect('breakpoint' in resolveOptions(list, 375)).toBeFalse();
  });

  it('takes a single object', () => {
    expect(resolveOptions({ imageSize: 'contain' }, 500).imageSize).toBe('contain');
    expect(NGM_DEFAULT_OPTIONS.imageSize).toBe('cover');
  });
});

describe('labels', () => {
  it('fills placeholders and keeps unknown ones', () => {
    expect(fill('{n} / {total}', { n: 2, total: 5 })).toBe('2 / 5');
    expect(fill('{x}', {})).toBe('{x}');
  });

  it('merges translations over the English defaults', () => {
    const l = resolveLabels({ close: '閉じる' });
    expect(l.close).toBe('閉じる');
    expect(l.next).toBe('Next');
  });
});

describe('media', () => {
  it('tells videos from pictures', () => {
    expect(mediaType({ type: 'video', big: 'a.png' })).toBe('video');
    expect(mediaType({ mimeType: 'video/webm' })).toBe('video');
    expect(mediaType({ mimeType: 'image/png' })).toBe('image');
    expect(mediaType({ big: 'https://x/clip.MP4?sig=1' })).toBe('video');
    expect(mediaType({ big: 'https://x/photo.jpg' })).toBe('image');
  });

  it('falls back between sizes as ngx-gallery does', () => {
    expect(defaultUrl({ medium: 'm', big: 'b' }, 'small')).toBe('m');
    expect(defaultUrl({ small: 's', big: 'b' }, 'medium')).toBe('b');
    expect(defaultUrl({ small: 's' }, 'big')).toBe('s');
    expect(defaultUrl({}, 'big')).toBeNull();
  });
});

describe('moving', () => {
  it('stops at the ends unless infinite', () => {
    expect(stepIndex(0, -1, 3, false)).toBe(0);
    expect(stepIndex(2, 1, 3, false)).toBe(2);
    expect(stepIndex(0, -1, 3, true)).toBe(2);
    expect(stepIndex(2, 1, 3, true)).toBe(0);
    expect(stepIndex(0, 1, 0, true)).toBe(0);
  });

  it('zooms in steps between the limits', () => {
    expect(nextZoom(1, 0.1, 0.5, 2)).toBe(1.1);
    expect(nextZoom(2, 0.5, 0.5, 2)).toBe(2);
    expect(nextZoom(0.6, -0.5, 0.5, 2)).toBe(0.5);
  });

  it('reads a swipe only when it is mostly sideways and long enough', () => {
    expect(swipeDirection(-80, 10)).toBe(1);
    expect(swipeDirection(80, 10)).toBe(-1);
    expect(swipeDirection(30, 0)).toBe(0);
    expect(swipeDirection(60, 90)).toBe(0);
  });
});

describe('thumbnails', () => {
  it('fills columns first by default', () => {
    expect(thumbnailPlace(0, 8, 3, 2, 'column')).toEqual({ col: 0, row: 0 });
    expect(thumbnailPlace(1, 8, 3, 2, 'column')).toEqual({ col: 0, row: 1 });
    expect(thumbnailPlace(2, 8, 3, 2, 'column')).toEqual({ col: 1, row: 0 });
    expect(thumbnailColumns(8, 3, 2, 'column')).toBe(4);
  });

  it('fills whole rows across all columns in row order', () => {
    expect(thumbnailPlace(0, 8, 3, 2, 'row')).toEqual({ col: 0, row: 0 });
    expect(thumbnailPlace(3, 8, 3, 2, 'row')).toEqual({ col: 3, row: 0 });
    expect(thumbnailPlace(4, 8, 3, 2, 'row')).toEqual({ col: 0, row: 1 });
  });

  it('fills a page row by row in page order', () => {
    expect(thumbnailPlace(2, 8, 3, 2, 'page')).toEqual({ col: 2, row: 0 });
    expect(thumbnailPlace(3, 8, 3, 2, 'page')).toEqual({ col: 0, row: 1 });
    expect(thumbnailPlace(6, 8, 3, 2, 'page')).toEqual({ col: 3, row: 0 });
    expect(thumbnailColumns(8, 3, 2, 'page')).toBe(5);
  });

  it('scrolls just enough to show a column', () => {
    expect(scrollToColumn(0, 5, 4, 8)).toBe(2);
    expect(scrollToColumn(3, 1, 4, 8)).toBe(1);
    expect(scrollToColumn(0, 2, 4, 8)).toBe(0);
    expect(scrollToColumn(0, 7, 4, 6)).toBe(2);
  });
});
