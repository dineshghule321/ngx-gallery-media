import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { isVideo } from './helpers';
import { NgmIconComponent } from './icon.component';
import { NgmGalleryItem, NgmImageSize } from './models';
import { NgmUrlStore } from './url-store';

/**
 * One picture or video at a size. A video shows its poster or first frame until `playing`, then a player with
 * controls. Loads only while `active` (lazy loading); shows a spinner while loading and a placeholder on error.
 */
@Component({
  selector: 'ngm-media',
  imports: [NgmIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ngm-media' },
  styles: `
    :host {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    img,
    video {
      display: block;
      width: 100%;
      height: 100%;
      object-position: center;
    }
    video.player {
      background: #000;
    }
    .state {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem;
      text-align: center;
      color: var(--ngm-muted, #6c757d);
      font-size: var(--ngm-state-size, 1.75rem);
    }
    .state p {
      margin: 0;
      font-size: 0.875rem;
    }
  `,
  template: `
    @let u = url();
    @if (u && !broken()) {
      @if (video()) {
        @if (playing()) {
          <video
            #player
            class="player"
            [src]="u"
            controls
            playsinline
            [autoplay]="true"
            [muted]="muted()"
            [loop]="loop()"
            [style.object-fit]="'contain'"
            [attr.aria-label]="name()"
            (loadeddata)="loaded.emit()"
            (error)="onError()"
            (ended)="videoEnded.emit()"
            (play)="playState.emit(true)"
            (pause)="playState.emit(false)"
          ></video>
        } @else if (item().poster) {
          <img
            [src]="item().poster"
            [alt]="alt()"
            [style.object-fit]="fit()"
            (load)="loaded.emit()"
            (error)="onError()"
          />
        } @else {
          <video
            [src]="u + '#t=0.5'"
            preload="metadata"
            muted
            playsinline
            tabindex="-1"
            [style.object-fit]="fit()"
            aria-hidden="true"
            (loadeddata)="loaded.emit()"
            (error)="onError()"
          ></video>
        }
      } @else {
        <img
          [src]="u"
          [alt]="alt()"
          [style.object-fit]="fit()"
          [style.transform]="transform()"
          [style.transition]="transition()"
          draggable="false"
          (load)="onLoad()"
          (error)="onError()"
        />
      }
    }
    @if (broken() || failed()) {
      <div class="state" role="img" [attr.aria-label]="errorText()">
        <ngm-icon name="broken" />
        @if (showErrorText()) {
          <p>{{ errorText() }}</p>
        }
      </div>
    } @else if (showSpinner() && (!u || (!ready() && !video()))) {
      <div class="state"><ngm-icon name="spinner" [cssClass]="spinnerIcon()" /></div>
    }
  `,
})
export class NgmMediaComponent {
  private readonly store = inject(NgmUrlStore);

  readonly item = input.required<NgmGalleryItem>();
  readonly size = input<NgmImageSize>('medium');
  readonly fit = input<'cover' | 'contain'>('cover');
  /** Load the URL (lazy loading keeps far items unloaded). */
  readonly active = input(true);
  /** A video plays with controls. */
  readonly playing = input(false);
  readonly muted = input(false);
  readonly loop = input(false);
  readonly showSpinner = input(true);
  readonly spinnerIcon = input<string | undefined>(undefined);
  readonly showErrorText = input(false);
  readonly errorText = input('');
  /** CSS transform of a picture (zoom, rotate, pan). */
  readonly transform = input<string | null>(null);
  readonly transition = input<string | null>(null);

  readonly loaded = output<void>();
  readonly videoEnded = output<void>();
  readonly playState = output<boolean>();
  /** The file failed: a picture did not load, or the browser cannot play a video. */
  readonly failure = output<void>();

  readonly player = viewChild<ElementRef<HTMLVideoElement>>('player');
  readonly ready = signal(false);
  readonly broken = signal(false);
  /** Size whose URL was already asked again after an error (once per item). */
  private refreshed: string | null = null;
  readonly video = computed(() => isVideo(this.item()));
  readonly url = computed(() => this.store.url(this.item(), this.size()));
  readonly failed = computed(() => this.store.failed(this.item(), this.size()));
  readonly name = computed(() => this.item().label || this.item().alt || '');
  readonly alt = computed(() => this.item().alt ?? this.item().label ?? '');

  constructor() {
    effect(() => {
      const item = this.item();
      const size = this.size();
      untracked(() => (this.refreshed = null));
      if (this.active()) untracked(() => this.store.ensure(item, size));
    });
    effect(() => {
      this.url();
      this.playing();
      untracked(() => {
        this.ready.set(false);
        this.broken.set(false);
      });
    });
  }

  onLoad(): void {
    this.ready.set(true);
    this.loaded.emit();
  }

  /** A failed file asks for a fresh URL once (expired signed links), then shows the error state. */
  onError(): void {
    const item = this.item();
    const size = this.size();
    if (this.refreshed !== `${size}`) {
      this.refreshed = `${size}`;
      void this.store.refresh(item, size).then((changed) => {
        if (!changed && this.item() === item) this.fail();
      });
      return;
    }
    this.fail();
  }

  private fail(): void {
    this.broken.set(true);
    this.failure.emit();
  }

  /** Pauses a playing video. */
  pause(): void {
    this.player()?.nativeElement.pause();
  }
}
