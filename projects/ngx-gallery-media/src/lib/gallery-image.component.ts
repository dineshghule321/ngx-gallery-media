import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { fill, isVideo, prefersReducedMotion, stepIndex, swipeDirection } from './helpers';
import { NgmIconComponent } from './icon.component';
import { NgmMediaComponent } from './media.component';
import { NgmGalleryItem, NgmGalleryLabels, NgmResolvedOptions } from './models';
import { NgmActionsComponent, NgmBulletsComponent } from './parts.component';

/**
 * The stage: the current picture or video large, with arrows, swipe, auto play, the change animation, the
 * caption, bullets, a counter and custom actions. A click opens the preview (or the item link); a video plays in
 * place when `videoInlinePlay`.
 */
@Component({
  selector: 'ngm-gallery-image',
  imports: [NgmMediaComponent, NgmIconComponent, NgmActionsComponent, NgmBulletsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngm-gallery-image',
    '[class.arrows-auto-hide]': 'options().imageArrowsAutoHide',
    '[class.animate]': 'leaving() !== null',
    '[class.no-motion]': 'noMotion',
    '[attr.data-animation]': 'options().imageAnimation',
    '[style.--ngm-dir]': 'direction()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'focused.set(false)',
    '(keydown.arrowleft)': 'move(-1, $event)',
    '(keydown.arrowright)': 'move(1, $event)',
    '(pointerdown)': 'down($event)',
    '(pointerup)': 'up($event)',
    '(pointercancel)': 'start = null',
    role: 'group',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'regionLabel()',
  },
  styles: `
    :host {
      position: relative;
      display: block;
      overflow: hidden;
      background: var(--ngm-stage-bg, var(--bs-tertiary-bg, #f1f3f5));
      border-radius: var(--ngm-radius, var(--bs-border-radius, 0.375rem));
      touch-action: pan-y;
    }
    .slide {
      position: absolute;
      inset: 0;
      visibility: hidden;
    }
    .slide.active,
    .slide.leaving {
      visibility: visible;
    }
    .slide.active {
      z-index: 1;
    }
    :host(.animate) .slide.active {
      animation: var(--ngm-in) var(--ngm-duration, 0.45s) ease both;
    }
    :host(.animate) .slide.leaving {
      animation: var(--ngm-out) var(--ngm-duration, 0.45s) ease both;
    }
    :host([data-animation='fade']) {
      --ngm-in: ngm-fade-in;
      --ngm-out: ngm-fade-out;
    }
    :host([data-animation='slide']) {
      --ngm-in: ngm-slide-in;
      --ngm-out: ngm-slide-out;
    }
    :host([data-animation='rotate']) {
      --ngm-in: ngm-rotate-in;
      --ngm-out: ngm-fade-out;
    }
    :host([data-animation='zoom']) {
      --ngm-in: ngm-zoom-in;
      --ngm-out: ngm-zoom-out;
    }
    :host(.no-motion) .slide {
      animation: none !important;
    }
    @keyframes ngm-fade-in {
      from {
        opacity: 0;
      }
    }
    @keyframes ngm-fade-out {
      to {
        opacity: 0;
      }
    }
    @keyframes ngm-slide-in {
      from {
        transform: translateX(calc(var(--ngm-dir) * 100%));
      }
    }
    @keyframes ngm-slide-out {
      to {
        transform: translateX(calc(var(--ngm-dir) * -100%));
      }
    }
    @keyframes ngm-rotate-in {
      from {
        opacity: 0;
        transform: rotate(calc(var(--ngm-dir) * 90deg)) scale(0.3);
      }
    }
    @keyframes ngm-zoom-in {
      from {
        opacity: 0;
        transform: scale(0.4);
      }
    }
    @keyframes ngm-zoom-out {
      to {
        opacity: 0;
        transform: scale(1.6);
      }
    }
    .open {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: block;
      border: 0;
      background: transparent;
      cursor: zoom-in;
    }
    a.open {
      cursor: pointer;
    }
    .open:focus-visible {
      outline: 3px solid var(--ngm-focus, var(--ngm-accent, var(--bs-primary, #1565c0)));
      outline-offset: -3px;
    }
    .play {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: rgba(0, 0, 0, 0.2);
      color: #fff;
      font-size: 4rem;
      cursor: pointer;
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.6));
    }
    .play:hover {
      background: rgba(0, 0, 0, 0.35);
    }
    .play:focus-visible {
      outline: 3px solid var(--ngm-focus, #fff);
      outline-offset: -3px;
    }
    .arrow {
      position: absolute;
      top: 50%;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      margin-top: -1.25rem;
      border: 0;
      border-radius: 50%;
      background: var(--ngm-control-bg, rgba(0, 0, 0, 0.5));
      color: var(--ngm-control-color, #fff);
      font-size: 1.5rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .arrow:hover:not(:disabled) {
      background: var(--ngm-control-bg-hover, rgba(0, 0, 0, 0.75));
    }
    .arrow:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .arrow:focus-visible {
      outline: 2px solid var(--ngm-focus, #fff);
      outline-offset: 2px;
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
    :host(.arrows-auto-hide:hover) .arrow,
    :host(.arrows-auto-hide:focus-within) .arrow {
      opacity: 1;
    }
    :host(.arrows-auto-hide:hover) .arrow:disabled {
      opacity: 0.35;
    }
    .top {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 3;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .counter {
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
      background: var(--ngm-control-bg, rgba(0, 0, 0, 0.5));
      color: var(--ngm-control-color, #fff);
      font-size: 0.8125rem;
    }
    .tool {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border: 0;
      border-radius: var(--ngm-radius, var(--bs-border-radius, 0.375rem));
      background: var(--ngm-control-bg, rgba(0, 0, 0, 0.5));
      color: var(--ngm-control-color, #fff);
      font-size: 1.125rem;
      cursor: pointer;
    }
    .tool:focus-visible {
      outline: 2px solid var(--ngm-focus, #fff);
      outline-offset: 2px;
    }
    .description {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 3;
      max-height: 40%;
      overflow: auto;
      padding: 0.5rem 0.75rem;
      background: var(--ngm-description-bg, rgba(0, 0, 0, 0.6));
      color: var(--ngm-description-color, #fff);
      font-size: 0.875rem;
    }
    .description.with-bullets {
      padding-bottom: 2rem;
    }
    ngm-bullets {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0.5rem;
      z-index: 4;
    }
  `,
  template: `
    @for (item of items(); track $index; let i = $index) {
      <div
        class="slide"
        [class.active]="i === index()"
        [class.leaving]="i === leaving()"
        [attr.aria-hidden]="i === index() ? null : 'true'"
        [attr.aria-roledescription]="'slide'"
      >
        @if (i === index() || i === leaving() || near(i) || !options().lazyLoading) {
          <ngm-media
            [item]="item"
            size="medium"
            [fit]="options().imageSize"
            [active]="loads(i)"
            [playing]="i === index() && playing()"
            [muted]="options().videoMuted"
            [loop]="options().videoLoop"
            [spinnerIcon]="options().spinnerIcon"
            [showErrorText]="i === index()"
            [errorText]="video(item) ? labels().cannotPlay : labels().loadFailed"
            (playState)="videoRunning.set($event)"
            (videoEnded)="videoRunning.set(false)"
            (failure)="failedAt.set(i)"
          />
        }
      </div>
    }
    @if (current(); as c) {
      @if (video(c) && options().videoInlinePlay && failedAt() !== index()) {
        @if (!playing()) {
          <button
            type="button"
            class="play"
            [attr.aria-label]="labels().play + ': ' + itemName(c)"
            (click)="guard($event) && play()"
          >
            <ngm-icon name="play" [cssClass]="options().playIcon" />
          </button>
        }
      } @else if (c.url) {
        <a
          class="open"
          [href]="c.url"
          [target]="options().linkTarget"
          rel="noopener"
          [attr.aria-label]="itemName(c)"
          (click)="guard($event)"
        ></a>
      } @else if (options().preview) {
        <button
          type="button"
          class="open"
          [attr.aria-label]="labels().preview + ': ' + itemName(c)"
          (click)="guard($event) && preview.emit(index())"
        ></button>
      }
      <div class="top">
        @if (options().imageCounter && items().length > 1) {
          <span class="counter">{{ counter() }}</span>
        }
        <ngm-actions [actions]="options().imageActions" [index]="index()" />
        @if (options().imagePreviewButton && options().preview) {
          <button
            type="button"
            class="tool"
            [attr.aria-label]="labels().preview"
            [title]="labels().preview"
            (click)="stopVideo(); preview.emit(index())"
          >
            <ngm-icon name="fullscreen" [cssClass]="options().fullscreenIcon" />
          </button>
        }
      </div>
      @if (options().imageDescription && c.description && !playing()) {
        <div class="description" [class.with-bullets]="options().imageBullets" [innerHTML]="c.description"></div>
      }
    }
    @if (options().imageArrows && items().length > 1) {
      <button
        type="button"
        class="arrow prev"
        [disabled]="!canMove(-1)"
        [attr.aria-label]="labels().previous"
        (click)="move(-1)"
      >
        <ngm-icon name="prev" [cssClass]="options().arrowPrevIcon" />
      </button>
      <button
        type="button"
        class="arrow next"
        [disabled]="!canMove(1)"
        [attr.aria-label]="labels().next"
        (click)="move(1)"
      >
        <ngm-icon name="next" [cssClass]="options().arrowNextIcon" />
      </button>
    }
    @if (options().imageBullets && items().length > 1) {
      <ngm-bullets
        [count]="items().length"
        [active]="index()"
        [labelText]="labels().show"
        (pick)="indexChange.emit($event)"
      />
    }
  `,
})
export class NgmGalleryImageComponent {
  readonly items = input.required<NgmGalleryItem[]>();
  readonly index = input.required<number>();
  readonly options = input.required<NgmResolvedOptions>();
  readonly labels = input.required<NgmGalleryLabels>();

  /** A new index was chosen (arrows, swipe, bullets, auto play). */
  readonly indexChange = output<number>();
  /** The preview should open at this index. */
  readonly preview = output<number>();

  readonly noMotion = prefersReducedMotion();
  readonly playing = signal(false);
  readonly videoRunning = signal(false);
  readonly hovered = signal(false);
  readonly focused = signal(false);
  readonly leaving = signal<number | null>(null);
  /** Item whose file failed (no play button over its message). */
  readonly failedAt = signal<number | null>(null);
  readonly direction = signal(1);
  readonly current = computed(() => this.items()[this.index()] ?? null);
  readonly counter = computed(() => fill(this.labels().counter, { n: this.index() + 1, total: this.items().length }));
  readonly regionLabel = computed(() => fill(this.labels().gallery, { total: this.items().length }));
  start: { x: number; y: number } | null = null;

  private last: number | null = null;
  private swiped = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // The change animation: the old item leaves, the new one enters from the side of the move.
    effect(() => {
      const i = this.index();
      untracked(() => {
        if (this.last !== null && this.last !== i) {
          const count = this.items().length;
          const forward =
            (i > this.last && !(this.last === 0 && i === count - 1)) || (this.last === count - 1 && i === 0);
          this.direction.set(forward ? 1 : -1);
          this.leaving.set(this.last);
        }
        this.last = i;
        this.playing.set(false);
        this.videoRunning.set(false);
      });
    });
    // Auto play: paused on hover (when asked), while focused inside, while a video plays, or in a hidden tab.
    effect(() => {
      const o = this.options();
      const paused =
        (o.imageAutoPlayPauseOnHover && this.hovered()) || this.focused() || this.videoRunning() || this.playing();
      this.clearTimer();
      if (o.imageAutoPlay && !paused && this.items().length > 1) {
        this.timer = setInterval(
          () => {
            if (typeof document !== 'undefined' && document.hidden) return;
            const next = stepIndex(this.index(), 1, this.items().length, true);
            this.indexChange.emit(next);
          },
          Math.max(500, o.imageAutoPlayInterval),
        );
      }
    });
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  video(item: NgmGalleryItem): boolean {
    return isVideo(item);
  }

  itemName(item: NgmGalleryItem): string {
    return item.label || item.alt || fill(this.labels().show, { n: this.index() + 1, total: this.items().length });
  }

  /** Neighbour of the current item (kept rendered so it is ready). */
  near(i: number): boolean {
    const n = this.items().length;
    return n > 1 && (i === (this.index() + 1) % n || i === (this.index() - 1 + n) % n);
  }

  /** Whether an item loads its URL now (lazy loading: the current one and its neighbours). */
  loads(i: number): boolean {
    return !this.options().lazyLoading || i === this.index() || this.near(i);
  }

  canMove(step: number): boolean {
    const n = this.items().length;
    if (n < 2) return false;
    if (this.options().imageInfinityMove) return true;
    const next = this.index() + step;
    return next >= 0 && next < n;
  }

  move(step: number, e?: Event): void {
    if (e && (e.target as HTMLElement | null)?.tagName === 'VIDEO') return;
    if (!this.canMove(step)) return;
    e?.preventDefault();
    this.indexChange.emit(stepIndex(this.index(), step, this.items().length, this.options().imageInfinityMove));
  }

  play(): void {
    this.playing.set(true);
  }

  stopVideo(): void {
    this.playing.set(false);
  }

  down(e: PointerEvent): void {
    if (!this.options().imageSwipe || e.button !== 0) return;
    this.start = { x: e.clientX, y: e.clientY };
  }

  up(e: PointerEvent): void {
    const s = this.start;
    this.start = null;
    if (!s) return;
    const dir = swipeDirection(e.clientX - s.x, e.clientY - s.y);
    if (!dir) return;
    // The click that follows a swipe must not open the preview or a link.
    this.swiped = true;
    setTimeout(() => (this.swiped = false));
    this.move(dir);
  }

  /** False (and the click cancelled) right after a swipe. */
  guard(e: Event): boolean {
    if (!this.swiped) return true;
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  private clearTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
