import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { fill, isVideo, scrollToColumn, swipeDirection, thumbnailColumns, thumbnailPlace } from './helpers';
import { NgmIconComponent } from './icon.component';
import { NgmMediaComponent } from './media.component';
import { NgmGalleryItem, NgmGalleryLabels, NgmResolvedOptions } from './models';
import { NgmActionsComponent } from './parts.component';

interface Thumb {
  index: number;
  item: NgmGalleryItem;
  col: number;
  row: number;
}

/**
 * Thumbnails on one or more rows, ordered by column, row or page. Arrows (or a swipe) move them by
 * `thumbnailsMoveSize` columns; the current item stays in view. Optionally the last thumbnail shows how many
 * items follow, or thumbnails are links.
 */
@Component({
  selector: 'ngm-gallery-thumbnails',
  imports: [NgTemplateOutlet, NgmMediaComponent, NgmIconComponent, NgmActionsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngm-gallery-thumbnails',
    '[class.arrows-auto-hide]': 'options().thumbnailsArrowsAutoHide',
    '[class.with-arrows]': 'showArrows()',
  },
  styles: `
    :host {
      position: relative;
      display: block;
      touch-action: pan-y;
    }
    .viewport {
      position: relative;
      height: 100%;
      overflow: hidden;
    }
    :host(.with-arrows) .viewport {
      margin: 0 2.25rem;
    }
    .track {
      position: absolute;
      inset: 0;
      transition: transform var(--ngm-duration, 0.45s) ease;
      transform: translateX(calc(var(--left) * -1 * (var(--w) + var(--m))));
    }
    .thumb {
      position: absolute;
      width: var(--w);
      height: var(--h);
      left: calc(var(--col) * (var(--w) + var(--m)));
      top: calc(var(--row) * (var(--h) + var(--m)));
      padding: 0;
      overflow: hidden;
      border: 2px solid transparent;
      border-radius: var(--ngm-radius, var(--bs-border-radius, 0.375rem));
      background: var(--ngm-thumb-bg, var(--bs-tertiary-bg, #f1f3f5));
      opacity: var(--ngm-thumb-opacity, 0.7);
      cursor: pointer;
      transition:
        opacity 0.2s,
        border-color 0.2s;
    }
    .thumb:hover,
    .thumb:focus-visible,
    .thumb.active {
      opacity: 1;
    }
    .thumb.active {
      border-color: var(--ngm-accent, var(--bs-primary, #1565c0));
    }
    .thumb:focus-visible {
      outline: 2px solid var(--ngm-focus, var(--ngm-accent, var(--bs-primary, #1565c0)));
      outline-offset: 1px;
    }
    .badge {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.5rem;
      pointer-events: none;
      filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.7));
    }
    .remaining {
      background: rgba(0, 0, 0, 0.55);
      font-weight: 600;
      filter: none;
    }
    ngm-actions {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      z-index: 1;
    }
    .arrow {
      position: absolute;
      top: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      margin-top: -1rem;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--ngm-thumb-arrow-color, var(--bs-body-color, #212529));
      font-size: 1.5rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .arrow:hover:not(:disabled) {
      background: var(--ngm-thumb-arrow-hover, rgba(0, 0, 0, 0.08));
    }
    .arrow:disabled {
      opacity: 0.3;
      cursor: default;
    }
    .arrow:focus-visible {
      outline: 2px solid var(--ngm-focus, var(--ngm-accent, var(--bs-primary, #1565c0)));
    }
    .arrow.prev {
      left: 0;
    }
    .arrow.next {
      right: 0;
    }
    :host(.arrows-auto-hide) .arrow {
      opacity: 0;
    }
    :host(.arrows-auto-hide:hover) .arrow:not(:disabled),
    :host(.arrows-auto-hide:focus-within) .arrow:not(:disabled) {
      opacity: 1;
    }
    @media (prefers-reduced-motion: reduce) {
      .track {
        transition: none;
      }
    }
  `,
  template: `
    @if (showArrows()) {
      <button
        type="button"
        class="arrow prev"
        [disabled]="!canMove(-1)"
        [attr.aria-label]="labels().previousThumbnails"
        (click)="moveBy(-1)"
      >
        <ngm-icon name="prev" [cssClass]="options().arrowPrevIcon" />
      </button>
    }
    <div
      class="viewport"
      role="list"
      [style.--cols]="options().thumbnailsColumns"
      [style.--rows]="options().thumbnailsRows"
      [style.--m]="options().thumbnailMargin + 'px'"
      [style.--w]="
        'calc((100% - ' +
        (options().thumbnailsColumns - 1) +
        ' * ' +
        options().thumbnailMargin +
        'px) / ' +
        options().thumbnailsColumns +
        ')'
      "
      [style.--h]="
        'calc((100% - ' +
        (options().thumbnailsRows - 1) +
        ' * ' +
        options().thumbnailMargin +
        'px) / ' +
        options().thumbnailsRows +
        ')'
      "
      [style.--left]="left()"
      (pointerdown)="down($event)"
      (pointerup)="up($event)"
      (pointercancel)="start = null"
    >
      <div class="track">
        @for (t of thumbs(); track t.index) {
          @let label = thumbLabel(t);
          @if (options().thumbnailsAsLinks && t.item.url) {
            <a
              class="thumb"
              role="listitem"
              [style.--col]="t.col"
              [style.--row]="t.row"
              [href]="t.item.url"
              [target]="options().linkTarget"
              rel="noopener"
              [attr.aria-label]="label"
              [attr.tabindex]="visible(t) ? null : -1"
              (click)="guard($event)"
            >
              <ng-container [ngTemplateOutlet]="inner" [ngTemplateOutletContext]="{ $implicit: t }" />
            </a>
          } @else {
            <button
              type="button"
              class="thumb"
              role="listitem"
              [class.active]="t.index === index()"
              [style.--col]="t.col"
              [style.--row]="t.row"
              [attr.aria-label]="label"
              [attr.aria-current]="t.index === index() ? 'true' : null"
              [attr.tabindex]="visible(t) ? null : -1"
              (click)="guard($event) && pick.emit(t.index)"
            >
              <ng-container [ngTemplateOutlet]="inner" [ngTemplateOutletContext]="{ $implicit: t }" />
            </button>
          }
        }
      </div>
    </div>
    @if (showArrows()) {
      <button
        type="button"
        class="arrow next"
        [disabled]="!canMove(1)"
        [attr.aria-label]="labels().moreThumbnails"
        (click)="moveBy(1)"
      >
        <ngm-icon name="next" [cssClass]="options().arrowNextIcon" />
      </button>
    }
    <ng-template #inner let-t>
      <ngm-media
        [item]="t.item"
        size="small"
        [fit]="options().thumbnailSize"
        [active]="loads(t)"
        [showSpinner]="false"
        [spinnerIcon]="options().spinnerIcon"
      />
      @if (video(t.item)) {
        <span class="badge"><ngm-icon name="play" [cssClass]="options().playIcon" /></span>
      }
      @if (t.index === remainingAt()) {
        <span class="badge remaining">{{ remainingText() }}</span>
      }
      @if (options().thumbnailActions.length) {
        <ngm-actions [actions]="options().thumbnailActions" [index]="t.index" />
      }
    </ng-template>
  `,
})
export class NgmGalleryThumbnailsComponent {
  readonly items = input.required<NgmGalleryItem[]>();
  readonly index = input.required<number>();
  readonly options = input.required<NgmResolvedOptions>();
  readonly labels = input.required<NgmGalleryLabels>();

  /** A thumbnail was chosen. */
  readonly pick = output<number>();

  /** First visible column. */
  readonly left = signal(0);
  start: { x: number; y: number } | null = null;
  private swiped = false;

  readonly totalColumns = computed(() => {
    const o = this.options();
    return thumbnailColumns(this.items().length, o.thumbnailsColumns, o.thumbnailsRows, o.thumbnailsOrder);
  });
  readonly thumbs = computed<Thumb[]>(() => {
    const o = this.options();
    const n = this.items().length;
    return this.items().map((item, index) => ({
      index,
      item,
      ...thumbnailPlace(index, n, o.thumbnailsColumns, o.thumbnailsRows, o.thumbnailsOrder),
    }));
  });
  /** Item that carries the "+N" badge, or -1. */
  readonly remainingAt = computed(() => {
    const o = this.options();
    if (!o.thumbnailsRemainingCount) return -1;
    const shown = o.thumbnailsColumns * o.thumbnailsRows;
    if (this.items().length <= shown) return -1;
    const last = this.thumbs().find((t) => t.col === o.thumbnailsColumns - 1 && t.row === o.thumbnailsRows - 1);
    return last ? last.index : shown - 1;
  });
  readonly remainingText = computed(() => {
    const o = this.options();
    return fill(this.labels().remaining, { count: this.items().length - o.thumbnailsColumns * o.thumbnailsRows });
  });
  readonly showArrows = computed(
    () =>
      this.options().thumbnailsArrows &&
      this.remainingAt() < 0 &&
      this.totalColumns() > this.options().thumbnailsColumns,
  );

  constructor() {
    // Keep the current item in view.
    effect(() => {
      const i = this.index();
      const t = this.thumbs()[i];
      const o = this.options();
      if (!t || this.remainingAt() >= 0) return;
      untracked(() => this.left.set(scrollToColumn(this.left(), t.col, o.thumbnailsColumns, this.totalColumns())));
    });
    // Fewer items or more columns: never leave empty space on the right.
    effect(() => {
      const max = Math.max(0, this.totalColumns() - this.options().thumbnailsColumns);
      untracked(() => {
        if (this.left() > max) this.left.set(max);
      });
    });
  }

  video(item: NgmGalleryItem): boolean {
    return isVideo(item);
  }

  thumbLabel(t: Thumb): string {
    const text = fill(this.labels().show, { n: t.index + 1, total: this.items().length });
    return t.item.label ? `${text}: ${t.item.label}` : text;
  }

  visible(t: Thumb): boolean {
    return t.col >= this.left() && t.col < this.left() + this.options().thumbnailsColumns;
  }

  /** Lazy loading: visible columns and one page on each side. */
  loads(t: Thumb): boolean {
    if (!this.options().lazyLoading) return true;
    const c = this.options().thumbnailsColumns;
    return t.col >= this.left() - c && t.col < this.left() + 2 * c;
  }

  canMove(dir: -1 | 1): boolean {
    const max = Math.max(0, this.totalColumns() - this.options().thumbnailsColumns);
    return dir < 0 ? this.left() > 0 : this.left() < max;
  }

  moveBy(dir: -1 | 1): void {
    const o = this.options();
    const max = Math.max(0, this.totalColumns() - o.thumbnailsColumns);
    this.left.set(Math.min(max, Math.max(0, this.left() + dir * Math.max(1, o.thumbnailsMoveSize))));
  }

  down(e: PointerEvent): void {
    if (!this.options().thumbnailsSwipe || e.button !== 0) return;
    this.start = { x: e.clientX, y: e.clientY };
  }

  up(e: PointerEvent): void {
    const s = this.start;
    this.start = null;
    if (!s) return;
    const dir = swipeDirection(e.clientX - s.x, e.clientY - s.y, 30);
    if (!dir) return;
    this.swiped = true;
    setTimeout(() => (this.swiped = false));
    this.moveBy(dir);
  }

  /** False (and the click cancelled) right after a swipe. */
  guard(e: Event): boolean {
    if (!this.swiped) return true;
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}
