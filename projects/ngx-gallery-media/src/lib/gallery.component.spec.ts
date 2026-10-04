import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgmGalleryComponent } from './gallery.component';
import { NgmGalleryItem, NgmGalleryOptions, NgmUrlResolver } from './models';
import { NgmGalleryPreviewService } from './preview.service';
import { NgmUrlStore } from './url-store';

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const items = (n: number): NgmGalleryItem[] =>
  Array.from({ length: n }, (_, i) => ({ small: PIXEL, medium: PIXEL, big: PIXEL, label: `Item ${i + 1}` }));

@Component({
  imports: [NgmGalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngm-gallery [images]="images()" [options]="options()" [resolver]="resolver()" />`,
})
class HostComponent {
  readonly images = signal<NgmGalleryItem[]>(items(6));
  readonly options = signal<NgmGalleryOptions | NgmGalleryOptions[]>({});
  readonly resolver = signal<NgmUrlResolver | null>(null);
}

describe('NgmGalleryComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const gallery = () => fixture.debugElement.children[0].componentInstance as NgmGalleryComponent;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => document.querySelectorAll('ngm-gallery-preview').forEach((n) => n.remove()));

  it('shows the stage and one thumbnail per item, starting at startIndex', () => {
    host.options.set({ startIndex: 2 });
    fixture.detectChanges();
    expect(el().querySelector('ngm-gallery-image')).not.toBeNull();
    expect(el().querySelectorAll('.thumb').length).toBe(6);
    expect(gallery().index()).toBe(2);
    expect(el().querySelector('.thumb.active')?.getAttribute('aria-label')).toContain('3 of 6');
  });

  it('moves with the public API and stops at the ends unless infinite', () => {
    fixture.detectChanges();
    const g = gallery();
    expect(g.canShowPrev()).toBeFalse();
    expect(g.showNext()).toBeTrue();
    expect(g.index()).toBe(1);
    g.show(5);
    expect(g.canShowNext()).toBeFalse();
    host.options.set({ imageInfinityMove: true });
    fixture.detectChanges();
    expect(g.showNext()).toBeTrue();
    expect(g.index()).toBe(0);
  });

  it('emits change with the item', () => {
    fixture.detectChanges();
    const seen: number[] = [];
    gallery().change.subscribe((c) => seen.push(c.index));
    gallery().show(3);
    expect(seen).toEqual([3]);
  });

  it('hides parts as asked: only thumbnails, only image, auto-hidden thumbnails', () => {
    host.options.set({ image: false });
    fixture.detectChanges();
    expect(el().querySelector('ngm-gallery-image')).toBeNull();
    host.options.set({ thumbnails: false });
    fixture.detectChanges();
    expect(el().querySelector('ngm-gallery-thumbnails')).toBeNull();
    host.options.set({ thumbnailsAutoHide: true });
    host.images.set(items(1));
    fixture.detectChanges();
    expect(el().querySelector('ngm-gallery-thumbnails')).toBeNull();
  });

  it('opens the preview from a thumbnail when there is no stage, and the stage follows it on close', () => {
    host.options.set({ image: false });
    fixture.detectChanges();
    (el().querySelectorAll('.thumb')[4] as HTMLButtonElement).click();
    fixture.detectChanges();
    const preview = el().querySelector('ngm-gallery-preview');
    expect(preview).not.toBeNull();
    expect(preview?.querySelector('.name')?.textContent).toContain('Item 5');
    (preview?.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('ngm-gallery-preview')).toBeNull();
    expect(gallery().index()).toBe(4);
  });

  it('calls previewCustom instead of the built-in preview', () => {
    const calls: number[] = [];
    host.options.set({ previewCustom: (i) => calls.push(i) });
    fixture.detectChanges();
    gallery().openPreview(1);
    fixture.detectChanges();
    expect(calls).toEqual([1]);
    expect(el().querySelector('ngm-gallery-preview')).toBeNull();
  });

  it('shows "+N" on the last thumbnail with thumbnailsRemainingCount', () => {
    host.options.set({ image: false, thumbnailsRemainingCount: true, thumbnailsColumns: 4 });
    fixture.detectChanges();
    expect(el().querySelector('.remaining')?.textContent?.trim()).toBe('+2');
    expect(el().querySelector('ngm-gallery-thumbnails .arrow')).toBeNull();
  });

  it('moves the thumbnails by thumbnailsMoveSize columns', () => {
    host.options.set({ thumbnailsColumns: 2, thumbnailsMoveSize: 2 });
    fixture.detectChanges();
    expect(gallery().canMoveThumbnailsLeft()).toBeFalse();
    gallery().moveThumbnailsRight();
    expect(gallery().thumbnailsRef()?.left()).toBe(2);
    gallery().moveThumbnailsRight();
    expect(gallery().thumbnailsRef()?.left()).toBe(4);
    expect(gallery().canMoveThumbnailsRight()).toBeFalse();
  });

  it('asks an async resolver for each URL once', async () => {
    const asked: string[] = [];
    host.resolver.set((item, size) => {
      asked.push(`${item.label}:${size}`);
      return Promise.resolve(PIXEL);
    });
    host.images.set([
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ]);
    host.options.set({ thumbnails: false });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(asked).toContain('A:medium');
    expect(asked.filter((a) => a === 'A:medium').length).toBe(1);
    expect(el().querySelector('ngm-gallery-image img')?.getAttribute('src')).toBe(PIXEL);
  });

  it('plays a video in place instead of opening the preview', () => {
    host.images.set([{ big: 'clip.webm', type: 'video', label: 'Clip' }]);
    fixture.detectChanges();
    const play = el().querySelector('ngm-gallery-image .play') as HTMLButtonElement;
    expect(play).not.toBeNull();
    play.click();
    fixture.detectChanges();
    expect(el().querySelector('ngm-gallery-image video[controls]')).not.toBeNull();
    expect(el().querySelector('ngm-gallery-preview')).toBeNull();
  });

  it('shows a counter, a preview button, bullets and the caption when asked', () => {
    host.images.set([{ ...items(1)[0], description: '<b>Spindle</b>' }, ...items(2)]);
    host.options.set({ imageCounter: true, imagePreviewButton: true, imageBullets: true, imageDescription: true });
    fixture.detectChanges();
    expect(el().querySelector('.counter')?.textContent?.trim()).toBe('1 / 3');
    expect(el().querySelectorAll('ngm-bullets button').length).toBe(3);
    expect(el().querySelector('.description b')?.textContent).toBe('Spindle');
    (el().querySelector('.top .tool') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('ngm-gallery-preview')).not.toBeNull();
  });

  it('auto plays and pauses while the pointer is over the stage', () => {
    jasmine.clock().install();
    try {
      host.options.set({ imageAutoPlay: true, imageAutoPlayInterval: 1000, imageAutoPlayPauseOnHover: true });
      fixture.detectChanges();
      jasmine.clock().tick(1001);
      expect(gallery().index()).toBe(1);
      el().querySelector('ngm-gallery-image')?.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      jasmine.clock().tick(3000);
      expect(gallery().index()).toBe(1);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('applies breakpoints when the window is resized', () => {
    host.options.set([{ thumbnailsColumns: 6 }, { breakpoint: 400, thumbnailsColumns: 2 }]);
    fixture.detectChanges();
    const g = gallery();
    g.width.set(1200);
    expect(g.opts().thumbnailsColumns).toBe(6);
    g.width.set(375);
    expect(g.opts().thumbnailsColumns).toBe(2);
  });

  it('loads only the shown item and its neighbours with lazy loading', () => {
    host.options.set({ thumbnails: false, startIndex: 3 });
    fixture.detectChanges();
    const rendered = el().querySelectorAll('ngm-gallery-image .slide ngm-media').length;
    expect(rendered).toBe(3);
    host.options.set({ thumbnails: false, lazyLoading: false });
    fixture.detectChanges();
    expect(el().querySelectorAll('ngm-gallery-image .slide ngm-media').length).toBe(6);
  });

  it('makes thumbnails and the stage links with thumbnailsAsLinks', () => {
    host.images.set(items(3).map((m, i) => ({ ...m, url: `https://example.com/${i}` })));
    host.options.set({ thumbnailsAsLinks: true, linkTarget: '_self' });
    fixture.detectChanges();
    const links = el().querySelectorAll('a.thumb');
    expect(links.length).toBe(3);
    expect(links[1].getAttribute('href')).toBe('https://example.com/1');
    expect(el().querySelector('ngm-gallery-image a.open')?.getAttribute('target')).toBe('_self');
  });
});

describe('NgmGalleryPreviewComponent through the service', () => {
  afterEach(() => document.querySelectorAll('ngm-gallery-preview').forEach((n) => n.remove()));

  it('opens over the page, zooms, rotates, moves by keys and closes on Escape', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const service = TestBed.inject(NgmGalleryPreviewService);
    const ref = service.open(items(3), {
      index: 1,
      options: { previewZoom: true, previewRotate: true, previewKeyboardNavigation: true, previewCounter: true },
    });
    const node = document.querySelector('ngm-gallery-preview') as HTMLElement;
    expect(node.getAttribute('role')).toBe('dialog');
    expect(node.querySelector('.counter')?.textContent?.trim()).toBe('2 / 3');
    (node.querySelector('button[aria-label="Zoom in"]') as HTMLButtonElement).click();
    (node.querySelector('button[aria-label="Rotate right"]') as HTMLButtonElement).click();
    TestBed.tick();
    const img = node.querySelector('.frame img') as HTMLImageElement;
    expect(img.style.transform).toContain('scale(1.1)');
    expect(img.style.transform).toContain('rotate(90deg)');
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    TestBed.tick();
    expect(node.querySelector('.counter')?.textContent?.trim()).toBe('3 / 3');
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(await ref.closed).toBe(2);
    expect(document.querySelector('ngm-gallery-preview')).toBeNull();
  });

  it('closes on a click beside the picture and gives focus back', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const ref = TestBed.inject(NgmGalleryPreviewService).open(items(2), { options: { previewCloseOnClick: true } });
    await new Promise((r) => setTimeout(r));
    const node = document.querySelector('ngm-gallery-preview') as HTMLElement;
    expect(node.contains(document.activeElement)).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');
    (node.querySelector('.stage') as HTMLElement).click();
    expect(await ref.closed).toBe(0);
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe('');
    opener.remove();
  });

  it('downloads through the handler', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const got: number[] = [];
    const ref = TestBed.inject(NgmGalleryPreviewService).open(items(2), {
      options: { previewDownload: true, downloadHandler: (_item, i) => void got.push(i) },
    });
    (document.querySelector('ngm-gallery-preview button[aria-label="Download"]') as HTMLButtonElement).click();
    expect(got).toEqual([0]);
    ref.close();
    await ref.closed;
  });
});

describe('NgmUrlStore', () => {
  it('replaces an expired URL with a fresh one, and reports when nothing changed', async () => {
    const store = new NgmUrlStore();
    let n = 0;
    store.setResolver(() => Promise.resolve(`u${++n}`));
    const item = { id: 1 };
    store.ensure(item, 'big');
    await Promise.resolve();
    await Promise.resolve();
    expect(store.url(item, 'big')).toBe('u1');
    expect(await store.refresh(item, 'big')).toBeTrue();
    expect(store.url(item, 'big')).toBe('u2');
    store.setResolver(() => 'same');
    store.ensure(item, 'big');
    expect(await store.refresh(item, 'big')).toBeFalse();
    expect(store.url(item, 'big')).toBe('same');
  });

  it('marks a resolver failure and retries on demand', async () => {
    const store = new NgmUrlStore();
    let fail = true;
    store.setResolver(() => (fail ? Promise.reject(new Error('x')) : Promise.resolve('u')));
    const item = { id: 1 };
    store.ensure(item, 'big');
    await Promise.resolve();
    await Promise.resolve();
    expect(store.failed(item, 'big')).toBeTrue();
    fail = false;
    store.retry(item, 'big');
    await Promise.resolve();
    await Promise.resolve();
    expect(store.url(item, 'big')).toBe('u');
  });
});
