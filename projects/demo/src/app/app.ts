import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  NgmGalleryComponent,
  NgmGalleryItem,
  NgmGalleryLabels,
  NgmGalleryOptions,
  NgmGalleryPreviewService,
  NgmUrlResolver,
} from 'ngx-gallery-media';
import { codeOf, Example, EXAMPLES, image, images, LABELS_JA } from './examples';

type Theme = 'blue' | 'orange';

@Component({
  selector: 'demo-root',
  imports: [NgmGalleryComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly preview = inject(NgmGalleryPreviewService);

  readonly theme = signal<Theme>('blue');
  readonly dark = signal(false);
  readonly lang = signal<'en' | 'ja'>('en');
  readonly menuOpen = signal(false);
  readonly log = signal<string[]>([]);
  readonly labels = computed<Partial<NgmGalleryLabels> | null>(() => (this.lang() === 'ja' ? LABELS_JA : null));
  readonly groups = ['ngx-gallery', 'Video', 'Extensions'] as const;
  readonly examples = EXAMPLES.map((e) => ({ ...e, options: this.withActions(e), code: codeOf(e) }));

  /** Dynamic example. */
  readonly dynamicImages = signal<NgmGalleryItem[]>(images(true, [1, 2, 3]));
  /** Async example. */
  readonly asyncImages = signal<NgmGalleryItem[] | null>(null);

  /** Simulated signed URLs: the URL arrives after a delay. */
  readonly resolver: NgmUrlResolver = (item, size) =>
    new Promise((resolve) =>
      setTimeout(
        () => resolve(`assets/img/${item.id}-${size === 'small' ? 'small' : size === 'big' ? 'big' : 'medium'}.jpg`),
        600,
      ),
    );

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      root.dataset['theme'] = this.theme();
      root.dataset['bsTheme'] = this.dark() ? 'dark' : 'light';
      root.lang = this.lang();
    });
    this.loadAsync();
  }

  byGroup(group: string): Example[] {
    return this.examples.filter((e) => e.group === group);
  }

  note(text: string): void {
    this.log.update((l) => [`${new Date().toLocaleTimeString()} ${text}`, ...l].slice(0, 6));
  }

  addImage(): void {
    this.dynamicImages.update((list) => [...list, image((list.length % 8) + 1, true)]);
  }

  removeImage(): void {
    this.dynamicImages.update((list) => list.slice(0, -1));
  }

  changeImages(): void {
    const order = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 4));
    this.dynamicImages.set(images(true, order));
  }

  loadAsync(): void {
    this.asyncImages.set(null);
    setTimeout(() => this.asyncImages.set(images(true)), 3000);
  }

  enlarge(list: NgmGalleryItem[], index: number): void {
    this.preview.open(list, {
      index,
      options: {
        previewZoom: true,
        previewRotate: true,
        previewKeyboardNavigation: true,
        previewCounter: true,
        previewFullscreen: true,
      },
      labels: this.labels() ?? undefined,
      onChange: (i) => this.note(`preview shows ${i + 1}`),
    });
  }

  copy(code: string): void {
    void navigator.clipboard?.writeText(code).then(() => this.note('code copied'));
  }

  /** The actions example gets its callbacks here (functions cannot live in the shared data). */
  private withActions(e: Example): NgmGalleryOptions[] {
    if (e.id !== 'actions') return e.options;
    return [
      {
        width: '100%',
        height: '400px',
        imageActions: [
          { icon: 'demo-icon demo-icon-heart', titleText: 'Like', onClick: (_e, i) => this.note(`liked ${i + 1}`) },
        ],
        thumbnailActions: [
          { icon: 'demo-icon demo-icon-close', titleText: 'Remove', onClick: (_e, i) => this.note(`remove ${i + 1}`) },
        ],
        actions: [
          {
            icon: 'demo-icon demo-icon-heart',
            titleText: 'Like',
            onClick: (_e, i) => this.note(`liked ${i + 1} in the preview`),
          },
        ],
        previewDownload: true,
        downloadHandler: (item, i) => this.note(`download ${item.label ?? i + 1} through the handler`),
      },
      { breakpoint: 576, height: '300px' },
    ];
  }
}
