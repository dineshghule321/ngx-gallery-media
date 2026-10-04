import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgmGalleryImageComponent } from './gallery-image.component';
import { NgmGalleryPreviewComponent } from './gallery-preview.component';
import { NgmGalleryThumbnailsComponent } from './gallery-thumbnails.component';
import { resolveLabels, resolveOptions, stepIndex } from './helpers';
import { NgmGalleryChange, NgmGalleryItem, NgmGalleryLabels, NgmGalleryOptions, NgmUrlResolver } from './models';
import { NgmUrlStore } from './url-store';

/**
 * Picture and video gallery: a stage, thumbnails and a full-window preview, configured like ngx-gallery
 * (`[images]`, `[options]` with breakpoints) and themed through CSS variables (Bootstrap's by default).
 *
 * ```html
 * <ngm-gallery [images]="items" [options]="[{ width: '100%', height: '420px' }, { breakpoint: 576, height: '260px' }]" />
 * ```
 */
@Component({
  selector: 'ngm-gallery',
  imports: [NgmGalleryImageComponent, NgmGalleryThumbnailsComponent, NgmGalleryPreviewComponent],
  providers: [NgmUrlStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngm-gallery',
    '[class.thumbnails-top]': "opts().layout === 'thumbnails-top'",
    '[class.full-width]': 'opts().fullWidth',
    '[style.width]': 'opts().fullWidth ? null : opts().width',
    '[style.height]': 'opts().aspectRatio ? null : opts().height',
    '[style.aspect-ratio]': 'opts().aspectRatio ?? null',
    '[style.--ngm-gap]': "opts().thumbnailsMargin + 'px'",
    '(window:resize)': 'measure()',
  },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--ngm-gap);
      max-width: 100%;
      box-sizing: border-box;
      color: var(--ngm-text, var(--bs-body-color, #212529));
    }
    :host *,
    :host *::before,
    :host *::after {
      box-sizing: border-box;
    }
    :host(.thumbnails-top) {
      flex-direction: column-reverse;
    }
    :host(.full-width) {
      width: 100vw;
      max-width: 100vw;
      margin-left: calc(50% - 50vw);
    }
    ngm-gallery-image,
    ngm-gallery-thumbnails {
      flex: 0 0 auto;
      min-height: 0;
    }
  `,
  template: `
    @let o = opts();
    @if (items().length) {
      @if (o.image) {
        <ngm-gallery-image
          [items]="items()"
          [index]="index()"
          [options]="o"
          [labels]="text()"
          [style.height]="stageHeight()"
          (indexChange)="show($event)"
          (preview)="openPreview($event)"
        />
      }
      @if (showThumbnails()) {
        <ngm-gallery-thumbnails
          [items]="items()"
          [index]="index()"
          [options]="o"
          [labels]="text()"
          [style.height]="thumbnailsHeight()"
          (pick)="thumbnailPicked($event)"
        />
      }
    }
    @if (previewIndex() !== null) {
      <ngm-gallery-preview
        [items]="items()"
        [startIndex]="previewIndex() ?? 0"
        [options]="o"
        [labels]="text()"
        (indexChange)="previewChange.emit({ index: $event, item: items()[$event] })"
        (closed)="previewClosed($event)"
      />
    }
  `,
})
export class NgmGalleryComponent {
  private readonly store = inject(NgmUrlStore);

  /** Pictures and videos. */
  readonly images = input<NgmGalleryItem[] | null | undefined>([]);
  /** Options, or an array of options where entries with `breakpoint` apply at that window width and below. */
  readonly options = input<NgmGalleryOptions | NgmGalleryOptions[] | null | undefined>(null);
  /** Texts for people and screen readers (translations); English by default. */
  readonly labels = input<Partial<NgmGalleryLabels> | null | undefined>(null);
  /** Gives the URL of an item at a size, sync or async (signed URLs). Default: the item's own URLs. */
  readonly resolver = input<NgmUrlResolver | null | undefined>(null);

  /** The items are set (also when they change). */
  readonly imagesReady = output<void>();
  /** The shown item changed (named as in ngx-gallery). */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly change = output<NgmGalleryChange>();
  readonly previewOpen = output<void>();
  readonly previewClose = output<void>();
  /** The item shown in the preview changed. */
  readonly previewChange = output<NgmGalleryChange>();

  readonly thumbnailsRef = viewChild(NgmGalleryThumbnailsComponent);
  readonly items = computed(() => this.images() ?? []);
  readonly width = signal(typeof window === 'undefined' ? 1024 : window.innerWidth);
  readonly opts = computed(() => resolveOptions(this.options(), this.width()));
  readonly text = computed(() => resolveLabels(this.labels()));
  readonly index = signal(0);
  readonly previewIndex = signal<number | null>(null);
  readonly showThumbnails = computed(() => {
    const o = this.opts();
    return o.thumbnails && !(o.thumbnailsAutoHide && this.items().length < 2);
  });
  readonly stageHeight = computed(() => {
    const o = this.opts();
    if (!this.showThumbnails()) return '100%';
    return `calc(${o.imagePercent}% - ${o.thumbnailsMargin * (o.imagePercent / 100)}px)`;
  });
  readonly thumbnailsHeight = computed(() => {
    const o = this.opts();
    if (!o.image) return '100%';
    return `calc(${o.thumbnailsPercent}% - ${o.thumbnailsMargin * (o.thumbnailsPercent / 100)}px)`;
  });

  private started = false;

  constructor() {
    effect(() => {
      const r = this.resolver();
      untracked(() => this.store.setResolver(r));
    });
    // New items: start at startIndex (first time) or keep the index in range; tell the page.
    effect(() => {
      const list = this.items();
      untracked(() => {
        const start = this.started ? this.index() : this.opts().startIndex;
        this.started = true;
        this.index.set(Math.min(Math.max(start, 0), Math.max(list.length - 1, 0)));
        this.imagesReady.emit();
      });
    });
  }

  /** Re-reads the window width (breakpoints). */
  measure(): void {
    if (typeof window !== 'undefined') this.width.set(window.innerWidth);
  }

  /** Shows item `index` on the stage. */
  show(index: number): void {
    const list = this.items();
    if (index < 0 || index >= list.length || index === this.index()) return;
    this.index.set(index);
    this.change.emit({ index, item: list[index] });
  }

  showNext(): boolean {
    if (!this.canShowNext()) return false;
    this.show(stepIndex(this.index(), 1, this.items().length, this.opts().imageInfinityMove));
    return true;
  }

  showPrev(): boolean {
    if (!this.canShowPrev()) return false;
    this.show(stepIndex(this.index(), -1, this.items().length, this.opts().imageInfinityMove));
    return true;
  }

  canShowNext(): boolean {
    const n = this.items().length;
    return n > 1 && (this.opts().imageInfinityMove || this.index() < n - 1);
  }

  canShowPrev(): boolean {
    const n = this.items().length;
    return n > 1 && (this.opts().imageInfinityMove || this.index() > 0);
  }

  /** Opens the preview at `index` (or calls `previewCustom`). */
  openPreview(index: number = this.index()): void {
    const o = this.opts();
    if (!this.items().length) return;
    if (o.previewCustom) {
      o.previewCustom(index);
      return;
    }
    this.previewIndex.set(Math.min(Math.max(index, 0), this.items().length - 1));
    this.previewOpen.emit();
  }

  closePreview(): void {
    if (this.previewIndex() === null) return;
    this.previewIndex.set(null);
    this.previewClose.emit();
  }

  moveThumbnailsRight(): void {
    this.thumbnailsRef()?.moveBy(1);
  }

  moveThumbnailsLeft(): void {
    this.thumbnailsRef()?.moveBy(-1);
  }

  canMoveThumbnailsRight(): boolean {
    return this.thumbnailsRef()?.canMove(1) ?? false;
  }

  canMoveThumbnailsLeft(): boolean {
    return this.thumbnailsRef()?.canMove(-1) ?? false;
  }

  thumbnailPicked(index: number): void {
    if (this.opts().image) this.show(index);
    else if (this.opts().preview) this.openPreview(index);
    else this.show(index);
  }

  previewClosed(last: number): void {
    // The stage follows the preview.
    this.show(last);
    this.closePreview();
  }
}
