import { Injectable, signal } from '@angular/core';
import { defaultUrl } from './helpers';
import { NgmGalleryItem, NgmImageSize, NgmUrlResolver } from './models';

interface Entry {
  url: string | null;
  state: 'loading' | 'ready' | 'failed';
}

/**
 * URLs of the items, asked from the resolver once per item and size (signed URLs can be async). Reads are
 * signals, so templates update when a URL arrives. One store per gallery or preview.
 */
@Injectable()
export class NgmUrlStore {
  private resolver: NgmUrlResolver = defaultUrl;
  private readonly entries = signal(new Map<NgmGalleryItem, Partial<Record<NgmImageSize, Entry>>>());

  /** Sets the resolver; known URLs are forgotten when it changes. */
  setResolver(resolver: NgmUrlResolver | null | undefined): void {
    const next = resolver ?? defaultUrl;
    if (next === this.resolver) return;
    this.resolver = next;
    this.entries.set(new Map());
  }

  /** URL if known (signal read). */
  url(item: NgmGalleryItem | null | undefined, size: NgmImageSize): string | null {
    return (item && this.entries().get(item)?.[size]?.url) ?? null;
  }

  /** Whether the URL could not be had. */
  failed(item: NgmGalleryItem | null | undefined, size: NgmImageSize): boolean {
    return !!item && this.entries().get(item)?.[size]?.state === 'failed';
  }

  /** Asks for the URL when not asked yet. Never call it from a template or a computed. */
  ensure(item: NgmGalleryItem | null | undefined, size: NgmImageSize): void {
    if (!item || this.entries().get(item)?.[size]) return;
    let result: ReturnType<NgmUrlResolver>;
    try {
      result = this.resolver(item, size);
    } catch {
      this.put(item, size, { url: null, state: 'failed' });
      return;
    }
    if (result instanceof Promise) {
      this.put(item, size, { url: null, state: 'loading' });
      result.then(
        (url) => this.put(item, size, url ? { url, state: 'ready' } : { url: null, state: 'failed' }),
        () => this.put(item, size, { url: null, state: 'failed' }),
      );
    } else {
      this.put(item, size, result ? { url: result, state: 'ready' } : { url: null, state: 'failed' });
    }
  }

  /** Forgets a failed URL so that `ensure` asks again. */
  retry(item: NgmGalleryItem, size: NgmImageSize): void {
    this.entries.update((map) => {
      const next = new Map(map);
      const sizes = { ...(next.get(item) ?? {}) };
      delete sizes[size];
      next.set(item, sizes);
      return next;
    });
    this.ensure(item, size);
  }

  /**
   * Asks the resolver again after a URL stopped working (for example a signed URL that expired while the page was
   * open). Resolves true when a different URL arrived (it replaces the old one), false otherwise.
   */
  async refresh(item: NgmGalleryItem, size: NgmImageSize): Promise<boolean> {
    const old = this.url(item, size);
    let next: string | null | undefined;
    try {
      next = await this.resolver(item, size);
    } catch {
      return false;
    }
    if (!next || next === old) return false;
    this.put(item, size, { url: next, state: 'ready' });
    return true;
  }

  private put(item: NgmGalleryItem, size: NgmImageSize, entry: Entry): void {
    this.entries.update((map) => {
      const next = new Map(map);
      next.set(item, { ...(next.get(item) ?? {}), [size]: entry });
      return next;
    });
  }
}
