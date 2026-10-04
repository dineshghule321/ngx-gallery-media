import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { NgmGalleryPreviewComponent } from './gallery-preview.component';
import { resolveLabels, resolveOptions } from './helpers';
import { NgmGalleryItem, NgmGalleryLabels, NgmGalleryOptions, NgmUrlResolver } from './models';
import { NgmUrlStore } from './url-store';

/** What `NgmGalleryPreviewService.open` takes besides the items. */
export interface NgmPreviewConfig {
  /** Item shown first (index). Default 0. */
  index?: number;
  options?: NgmGalleryOptions | NgmGalleryOptions[];
  labels?: Partial<NgmGalleryLabels>;
  resolver?: NgmUrlResolver;
  /** Called when the shown item changes. */
  onChange?: (index: number) => void;
}

/** An open preview. */
export interface NgmPreviewRef {
  close(): void;
  /** Resolves with the last shown index when the preview closes. */
  readonly closed: Promise<number>;
}

/**
 * Opens the full-window preview without a gallery on the page, for example from an "enlarge" button:
 *
 * ```ts
 * this.preview.open(items, { index: 2, options: { previewZoom: true, previewKeyboardNavigation: true } });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NgmGalleryPreviewService {
  private readonly appRef = inject(ApplicationRef);
  private readonly env = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);

  open(items: NgmGalleryItem[], config: NgmPreviewConfig = {}): NgmPreviewRef {
    const store = new NgmUrlStore();
    store.setResolver(config.resolver);
    const elementInjector = Injector.create({ providers: [{ provide: NgmUrlStore, useValue: store }] });
    const ref: ComponentRef<NgmGalleryPreviewComponent> = createComponent(NgmGalleryPreviewComponent, {
      environmentInjector: this.env,
      elementInjector,
    });
    const width = typeof window === 'undefined' ? 1024 : window.innerWidth;
    ref.setInput('items', items);
    ref.setInput('startIndex', config.index ?? 0);
    ref.setInput('options', resolveOptions(config.options, width));
    ref.setInput('labels', resolveLabels(config.labels));

    let done!: (index: number) => void;
    const closed = new Promise<number>((resolve) => (done = resolve));
    let open = true;
    const finish = (index: number) => {
      if (!open) return;
      open = false;
      this.appRef.detachView(ref.hostView);
      ref.destroy();
      done(index);
    };
    ref.instance.indexChange.subscribe((i) => config.onChange?.(i));
    ref.instance.closed.subscribe((i) => finish(i));

    this.appRef.attachView(ref.hostView);
    this.document.body.appendChild(ref.location.nativeElement as HTMLElement);
    ref.changeDetectorRef.detectChanges();

    return {
      close: () => {
        if (open) ref.instance.close();
      },
      closed,
    };
  }
}
