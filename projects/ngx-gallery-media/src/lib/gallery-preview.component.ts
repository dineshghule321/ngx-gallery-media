import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  defaultUrl,
  fill,
  isVideo,
  nextZoom,
  prefersReducedMotion,
  resolveLabels,
  resolveOptions,
  stepIndex,
  swipeDirection,
} from './helpers';
import { NgmIconComponent } from './icon.component';
import { NgmMediaComponent } from './media.component';
import { NgmGalleryItem, NgmGalleryLabels, NgmResolvedOptions } from './models';
import { NgmActionsComponent, NgmBulletsComponent } from './parts.component';
import { NgmUrlStore } from './url-store';

const FOCUSABLE = 'button:not([disabled]), [href], video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Full-window preview: the item large with zoom (buttons, wheel, double click, keys), pan, rotate, browser full
 * screen, download, auto play, swipe, keyboard, caption, bullets, counter, thumbnails and custom actions. A video
 * plays with controls. Focus stays inside while open and returns to where it was on close.
 */
@Component({
  selector: 'ngm-gallery-preview',
  imports: [NgmMediaComponent, NgmIconComponent, NgmActionsComponent, NgmBulletsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngm-gallery-preview',
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-label]': 'labels().preview',
    '[class.arrows-auto-hide]': 'options().previewArrowsAutoHide',
    '[class.no-motion]': 'noMotion',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(keydown)': 'key($event)',
  },
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: var(--ngm-preview-z, 10000);
      display: flex;
      flex-direction: column;
      background: var(--ngm-preview-bg, #0e0e0e);
      color: var(--ngm-preview-color, #fff);
      font-family: inherit;
      outline: 0;
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      min-height: 3rem;
      padding: 0.25rem 0.5rem;
    }
    .name {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.9375rem;
    }
    .counter {
      padding: 0 0.5rem;
      white-space: nowrap;
      font-size: 0.875rem;
      opacity: 0.85;
    }
    .tool {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 0;
      border-radius: var(--ngm-radius, var(--bs-border-radius, 0.375rem));
      background: transparent;
      color: inherit;
      font-size: 1.375rem;
      cursor: pointer;
    }
    .tool:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
    }
    .tool:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .tool:focus-visible,
    .arrow:focus-visible,
    .pthumb:focus-visible,
    .retry:focus-visible {
      outline: 2px solid var(--ngm-focus, #fff);
      outline-offset: 2px;
    }
    .stage {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      touch-action: none;
    }
    .frame {
      position: absolute;
      inset: 0.5rem 3.5rem;
    }
    .frame.enter {
      animation: ngm-preview-in 0.3s ease both;
    }
    :host(.no-motion) .frame.enter {
      animation: none;
    }
    @keyframes ngm-preview-in {
      from {
        opacity: 0;
      }
    }
    .frame ngm-media {
      --ngm-muted: rgba(255, 255, 255, 0.75);
    }
    .zoomed {
      cursor: grab;
    }
    .zoomed.dragging {
      cursor: grabbing;
    }
    .arrow {
      position: absolute;
      top: 50%;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      margin-top: -1.375rem;
      border: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      color: inherit;
      font-size: 1.75rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .arrow:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
    }
    .arrow:disabled {
      opacity: 0.3;
      cursor: default;
    }
    .arrow.prev {
      left: 0.5rem;
    }
    .arrow.next {
      right: 0.5rem;
    }
    :host(.arrows-auto-hide) .arrow {
      opacity: 0;
    }
    :host(.arrows-auto-hide:hover) .arrow:not(:disabled),
    :host(.arrows-auto-hide:focus-within) .arrow:not(:disabled) {
      opacity: 1;
    }
    .unplayable {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      text-align: center;
      padding: 1rem;
    }
    .unplayable p {
      margin: 0;
    }
    .retry {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: var(--ngm-radius, var(--bs-border-radius, 0.375rem));
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .description {
      max-height: 25vh;
      overflow: auto;
      padding: 0.5rem 1rem;
      text-align: center;
      font-size: 0.9375rem;
    }
    ngm-bullets {
      padding: 0.5rem 0;
    }
    .pthumbs {
      display: flex;
      gap: 0.375rem;
      padding: 0.5rem;
      overflow-x: auto;
      scrollbar-width: thin;
    }
    .pthumb {
      position: relative;
      flex: 0 0 auto;
      width: 4.5rem;
      height: 3.25rem;
      padding: 0;
      overflow: hidden;
      border: 2px solid transparent;
      border-radius: var(--ngm-radius, var(--bs-border-radius, 0.375rem));
      background: rgba(255, 255, 255, 0.08);
      opacity: 0.6;
      cursor: pointer;
    }
    .pthumb.active {
      border-color: var(--ngm-accent, var(--bs-primary, #1565c0));
      opacity: 1;
    }
    .pthumb:hover {
      opacity: 1;
    }
    .pthumb .badge {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      filter: drop-shadow(0 0 3px #000);
    }
    @media (max-width: 575.98px) {
      .bar {
        flex-wrap: wrap;
        justify-content: flex-end;
        row-gap: 0;
      }
      .name {
        flex-basis: 100%;
        padding: 0.25rem 0.25rem 0;
      }
      .frame {
        inset: 0.25rem;
      }
      .arrow {
        width: 2.25rem;
        height: 2.25rem;
        margin-top: -1.125rem;
        background: rgba(0, 0, 0, 0.45);
      }
      .tool {
        width: 2.25rem;
      }
    }
  `,
  template: `
    @let c = current();
    <div class="bar">
      <span class="name" [id]="titleId">{{ c ? name(c) : '' }}</span>
      @if (options().previewCounter && items().length > 1) {
        <span class="counter">{{ counter() }}</span>
      }
      <ngm-actions [actions]="options().actions" [index]="index()" />
      @if (options().previewDownload && c) {
        <button
          type="button"
          class="tool"
          [attr.aria-label]="labels().download"
          [title]="labels().download"
          (click)="download()"
        >
          <ngm-icon name="download" [cssClass]="options().downloadIcon" />
        </button>
      }
      @if (options().previewZoom && c && !video(c)) {
        <button
          type="button"
          class="tool"
          [disabled]="zoom() <= options().previewZoomMin"
          [attr.aria-label]="labels().zoomOut"
          [title]="labels().zoomOut"
          (click)="zoomBy(-1)"
        >
          <ngm-icon name="zoomOut" [cssClass]="options().zoomOutIcon" />
        </button>
        <button
          type="button"
          class="tool"
          [disabled]="zoom() >= options().previewZoomMax"
          [attr.aria-label]="labels().zoomIn"
          [title]="labels().zoomIn"
          (click)="zoomBy(1)"
        >
          <ngm-icon name="zoomIn" [cssClass]="options().zoomInIcon" />
        </button>
      }
      @if (options().previewRotate && c && !video(c)) {
        <button
          type="button"
          class="tool"
          [attr.aria-label]="labels().rotateLeft"
          [title]="labels().rotateLeft"
          (click)="rotate(-90)"
        >
          <ngm-icon name="rotateLeft" [cssClass]="options().rotateLeftIcon" />
        </button>
        <button
          type="button"
          class="tool"
          [attr.aria-label]="labels().rotateRight"
          [title]="labels().rotateRight"
          (click)="rotate(90)"
        >
          <ngm-icon name="rotateRight" [cssClass]="options().rotateRightIcon" />
        </button>
      }
      @if (options().previewFullscreen && fullscreenSupported) {
        <button
          type="button"
          class="tool"
          [attr.aria-label]="fullscreen() ? labels().exitFullscreen : labels().fullscreen"
          [title]="fullscreen() ? labels().exitFullscreen : labels().fullscreen"
          (click)="toggleFullscreen()"
        >
          <ngm-icon [name]="fullscreen() ? 'exitFullscreen' : 'fullscreen'" [cssClass]="options().fullscreenIcon" />
        </button>
      }
      <button
        #closeButton
        type="button"
        class="tool"
        [attr.aria-label]="labels().close"
        [title]="labels().close"
        (click)="close()"
      >
        <ngm-icon name="close" [cssClass]="options().closeIcon" />
      </button>
    </div>
    <!-- A click beside the picture closes it (previewCloseOnClick); keyboard users have Escape and the close button. -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <div
      class="stage"
      (click)="stageClick($event)"
      (wheel)="wheel($event)"
      (dblclick)="doubleClick()"
      (pointerdown)="down($event)"
      (pointermove)="drag($event)"
      (pointerup)="up($event)"
      (pointercancel)="pointer = null"
    >
      @if (c) {
        @for (shown of [c]; track index()) {
          <div
            class="frame"
            [class.enter]="options().previewAnimation"
            [class.zoomed]="zoom() > 1"
            [class.dragging]="dragging()"
          >
            <ngm-media
              [item]="shown"
              size="big"
              fit="contain"
              [playing]="video(shown)"
              [muted]="options().videoMuted"
              [loop]="options().videoLoop"
              [spinnerIcon]="options().spinnerIcon"
              [showErrorText]="true"
              [errorText]="labels().loadFailed"
              [transform]="video(shown) ? null : transform()"
              [transition]="dragging() ? 'none' : 'transform 0.2s ease'"
              (failure)="failed.set(video(shown))"
              (playState)="videoRunning.set($event)"
              (videoEnded)="videoRunning.set(false)"
            />
          </div>
        }
        @if (failed()) {
          <div class="unplayable" role="alert">
            <ngm-icon name="broken" />
            <p>{{ labels().cannotPlay }}</p>
            @if (options().previewDownload) {
              <button type="button" class="retry" (click)="download()">
                <ngm-icon name="download" [cssClass]="options().downloadIcon" />{{ labels().download }}
              </button>
            }
          </div>
        }
      }
      @if (options().previewArrows && items().length > 1) {
        <button
          type="button"
          class="arrow prev"
          [disabled]="!canMove(-1)"
          [attr.aria-label]="labels().previous"
          (click)="move(-1)"
          (pointerdown)="$event.stopPropagation()"
        >
          <ngm-icon name="prev" [cssClass]="options().arrowPrevIcon" />
        </button>
        <button
          type="button"
          class="arrow next"
          [disabled]="!canMove(1)"
          [attr.aria-label]="labels().next"
          (click)="move(1)"
          (pointerdown)="$event.stopPropagation()"
        >
          <ngm-icon name="next" [cssClass]="options().arrowNextIcon" />
        </button>
      }
    </div>
    @if (options().previewDescription && c?.description) {
      <div class="description" [innerHTML]="c?.description"></div>
    }
    @if (options().previewBullets && items().length > 1) {
      <ngm-bullets [count]="items().length" [active]="index()" [labelText]="labels().show" (pick)="show($event)" />
    }
    @if (options().previewThumbnails && items().length > 1) {
      <div class="pthumbs" role="list">
        @for (t of items(); track $index; let i = $index) {
          <button
            type="button"
            class="pthumb"
            role="listitem"
            [class.active]="i === index()"
            [attr.aria-current]="i === index() ? 'true' : null"
            [attr.aria-label]="thumbLabel(i)"
            (click)="show(i)"
          >
            <ngm-media [item]="t" size="small" [showSpinner]="false" />
            @if (video(t)) {
              <span class="badge"><ngm-icon name="play" [cssClass]="options().playIcon" /></span>
            }
          </button>
        }
      </div>
    }
  `,
})
export class NgmGalleryPreviewComponent {
  private readonly store = inject(NgmUrlStore);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  readonly items = input<NgmGalleryItem[]>([]);
  readonly startIndex = input(0);
  readonly options = input<NgmResolvedOptions>(resolveOptions(null, 1024));
  readonly labels = input<NgmGalleryLabels>(resolveLabels(null));

  /** The shown item changed. */
  readonly indexChange = output<number>();
  /** The preview closed; carries the last shown index. */
  readonly closed = output<number>();

  readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  readonly titleId = `ngm-preview-${Math.random().toString(36).slice(2, 9)}`;
  readonly noMotion = prefersReducedMotion();
  readonly fullscreenSupported = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  readonly index = signal(0);
  readonly zoom = signal(1);
  readonly rotation = signal(0);
  readonly offset = signal({ x: 0, y: 0 });
  readonly dragging = signal(false);
  readonly fullscreen = signal(false);
  readonly failed = signal(false);
  readonly hovered = signal(false);
  readonly videoRunning = signal(false);
  readonly current = computed(() => this.items()[this.index()] ?? null);
  readonly counter = computed(() => fill(this.labels().counter, { n: this.index() + 1, total: this.items().length }));
  readonly transform = computed(() => {
    const o = this.offset();
    return `translate(${o.x}px, ${o.y}px) scale(${this.zoom()}) rotate(${this.rotation()}deg)`;
  });

  pointer: { id: number; x: number; y: number; ox: number; oy: number; moved: boolean } | null = null;
  private returnFocus: HTMLElement | null = null;
  private bodyOverflow = '';
  private timer: ReturnType<typeof setInterval> | null = null;
  private closing = false;
  private readonly onFullscreen = () =>
    this.fullscreen.set(this.document.fullscreenElement === this.host.nativeElement);

  constructor() {
    this.returnFocus = this.document.activeElement as HTMLElement | null;
    this.bodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.document.addEventListener('fullscreenchange', this.onFullscreen);

    effect(() => {
      const start = this.startIndex();
      untracked(() => this.index.set(Math.min(Math.max(start, 0), Math.max(this.items().length - 1, 0))));
    });
    // Load the shown item and its neighbours ahead.
    effect(() => {
      const list = this.items();
      const i = this.index();
      untracked(() => {
        for (const step of [0, 1, -1]) {
          const item = list[stepIndex(i, step, list.length, true)];
          if (item && (step === 0 || !isVideo(item))) this.store.ensure(item, 'big');
        }
      });
    });
    // Auto play.
    effect(() => {
      const o = this.options();
      const paused = (o.previewAutoPlayPauseOnHover && this.hovered()) || this.videoRunning() || this.zoom() !== 1;
      this.clearTimer();
      if (o.previewAutoPlay && !paused && this.items().length > 1) {
        this.timer = setInterval(() => this.move(1, true), Math.max(500, o.previewAutoPlayInterval));
      }
    });
    afterNextRender(() => {
      this.closeButton()?.nativeElement.focus();
      if (this.options().previewForceFullscreen) void this.enterFullscreen();
    });
    inject(DestroyRef).onDestroy(() => this.cleanUp());
  }

  video(item: NgmGalleryItem | null): boolean {
    return isVideo(item);
  }

  name(item: NgmGalleryItem): string {
    return item.label || item.alt || '';
  }

  thumbLabel(i: number): string {
    const text = fill(this.labels().show, { n: i + 1, total: this.items().length });
    const label = this.items()[i]?.label;
    return label ? `${text}: ${label}` : text;
  }

  show(i: number): void {
    if (i === this.index() || i < 0 || i >= this.items().length) return;
    this.index.set(i);
    this.resetView();
    this.indexChange.emit(i);
  }

  canMove(step: number): boolean {
    const n = this.items().length;
    if (n < 2) return false;
    if (this.options().previewInfinityMove) return true;
    const next = this.index() + step;
    return next >= 0 && next < n;
  }

  /** Next or previous item; auto play always wraps. */
  move(step: number, wrap = false): void {
    const n = this.items().length;
    if (!wrap && !this.canMove(step)) return;
    this.show(stepIndex(this.index(), step, n, wrap || this.options().previewInfinityMove));
  }

  zoomBy(dir: 1 | -1): void {
    const o = this.options();
    const z = nextZoom(this.zoom(), dir * o.previewZoomStep, o.previewZoomMin, o.previewZoomMax);
    this.zoom.set(z);
    if (z <= 1) this.offset.set({ x: 0, y: 0 });
  }

  rotate(deg: number): void {
    this.rotation.update((r) => (r + deg) % 360);
  }

  wheel(e: WheelEvent): void {
    if (!this.options().previewZoom || this.video(this.current())) return;
    e.preventDefault();
    this.zoomBy(e.deltaY < 0 ? 1 : -1);
  }

  doubleClick(): void {
    const o = this.options();
    if (!o.previewZoom || this.video(this.current())) return;
    if (this.zoom() !== 1) this.resetView();
    else this.zoom.set(Math.min(o.previewZoomMax, 2));
  }

  down(e: PointerEvent): void {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, video')) return;
    const o = this.offset();
    this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: o.x, oy: o.y, moved: false };
  }

  drag(e: PointerEvent): void {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) p.moved = true;
    if (this.zoom() > 1) {
      this.dragging.set(true);
      this.offset.set({ x: p.ox + dx, y: p.oy + dy });
    }
  }

  up(e: PointerEvent): void {
    const p = this.pointer;
    this.pointer = null;
    this.dragging.set(false);
    if (!p || p.id !== e.pointerId) return;
    if (this.zoom() <= 1 && this.options().previewSwipe) {
      const dir = swipeDirection(e.clientX - p.x, e.clientY - p.y);
      if (dir) this.move(dir);
    }
  }

  /** Close on a click outside the picture (previewCloseOnClick). */
  stageClick(e: MouseEvent): void {
    if (!this.options().previewCloseOnClick || this.dragging()) return;
    const target = e.target as HTMLElement;
    if (target.closest('img, video, button, .unplayable')) return;
    this.close();
  }

  key(e: KeyboardEvent): void {
    const o = this.options();
    const target = e.target as HTMLElement | null;
    if (e.key === 'Tab') {
      this.trapFocus(e);
      return;
    }
    if (e.key === 'Escape') {
      if (o.previewCloseOnEsc) {
        e.preventDefault();
        this.close();
      }
      return;
    }
    if (!o.previewKeyboardNavigation || target?.tagName === 'VIDEO') return;
    const image = !this.video(this.current());
    if (e.key === 'ArrowLeft') this.move(-1);
    else if (e.key === 'ArrowRight') this.move(1);
    else if (o.previewZoom && image && (e.key === '+' || e.key === '=')) this.zoomBy(1);
    else if (o.previewZoom && image && e.key === '-') this.zoomBy(-1);
    else if (image && e.key === '0') this.resetView();
    else return;
    e.preventDefault();
  }

  async download(): Promise<void> {
    const item = this.current();
    if (!item) return;
    const handler = this.options().downloadHandler;
    if (handler) {
      await handler(item, this.index());
      return;
    }
    const url = item.big ?? defaultUrl(item, 'big') ?? this.store.url(item, 'big');
    if (!url) return;
    const a = this.document.createElement('a');
    a.href = url;
    a.download = '';
    a.rel = 'noopener';
    this.document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async toggleFullscreen(): Promise<void> {
    if (this.document.fullscreenElement) await this.document.exitFullscreen().catch(() => undefined);
    else await this.enterFullscreen();
  }

  close(): void {
    if (this.closing) return;
    this.closing = true;
    this.closed.emit(this.index());
  }

  private async enterFullscreen(): Promise<void> {
    try {
      await (this.host.nativeElement as HTMLElement).requestFullscreen();
    } catch {
      // Refused (no user gesture, or not allowed): the preview already fills the window.
    }
  }

  private resetView(): void {
    this.zoom.set(1);
    this.rotation.set(0);
    this.offset.set({ x: 0, y: 0 });
    this.failed.set(false);
    this.videoRunning.set(false);
  }

  private trapFocus(e: KeyboardEvent): void {
    const nodes = Array.from((this.host.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null,
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = this.document.activeElement;
    if (e.shiftKey && (active === first || !this.host.nativeElement.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  private clearTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private cleanUp(): void {
    this.clearTimer();
    this.document.removeEventListener('fullscreenchange', this.onFullscreen);
    this.document.body.style.overflow = this.bodyOverflow;
    if (this.document.fullscreenElement === this.host.nativeElement) {
      void this.document.exitFullscreen().catch(() => undefined);
    }
    this.returnFocus?.focus?.();
  }
}
