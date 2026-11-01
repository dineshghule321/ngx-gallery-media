import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgmMediaComponent } from './media.component';
import { NgmGalleryItem } from './models';
import { NgmUrlStore } from './url-store';

@Component({
  imports: [NgmMediaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngm-media [item]="item()" size="small" [errorText]="errorText()" />`,
})
class HostComponent {
  readonly item = signal<NgmGalleryItem>({ small: 'data:image/png;base64,broken', label: 'Broken' });
  readonly errorText = signal('');
}

describe('NgmMediaComponent broken state', () => {
  let fixture: ComponentFixture<HostComponent>;
  const state = () => (fixture.nativeElement as HTMLElement).querySelector('.state');

  async function broken(text: string): Promise<Element | null> {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection(), NgmUrlStore],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.errorText.set(text);
    fixture.detectChanges();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    img?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    fixture.detectChanges();
    return state();
  }

  it('names the broken picture with the error text', async () => {
    const s = await broken('The picture could not be loaded');
    expect(s?.getAttribute('role')).toBe('img');
    expect(s?.getAttribute('aria-label')).toBe('The picture could not be loaded');
    expect(s?.hasAttribute('aria-hidden')).toBeFalse();
  });

  it('hides the state without a text instead of an image with an empty name (thumbnails)', async () => {
    const s = await broken('');
    expect(s).not.toBeNull();
    expect(s?.hasAttribute('role')).toBeFalse();
    expect(s?.hasAttribute('aria-label')).toBeFalse();
    expect(s?.getAttribute('aria-hidden')).toBe('true');
  });
});

@Component({
  imports: [NgmMediaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngm-media [item]="item()" size="small" [playing]="playing()" [protect]="protect()" />`,
})
class ProtectHostComponent {
  readonly item = signal<NgmGalleryItem>({ small: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', label: 'Pixel' });
  readonly playing = signal(false);
  readonly protect = signal(true);
}

describe('NgmMediaComponent protectMedia', () => {
  let fixture: ComponentFixture<ProtectHostComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  /** Whether the browser's default (save menu, drag) of an event on `target` was cancelled. */
  const cancelled = (target: Element, type: string): boolean => {
    const e = new MouseEvent(type, { bubbles: true, cancelable: true });
    target.dispatchEvent(e);
    return e.defaultPrevented;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProtectHostComponent],
      providers: [provideZonelessChangeDetection(), NgmUrlStore],
    });
    fixture = TestBed.createComponent(ProtectHostComponent);
  });

  it('cancels the save menu and dragging of a picture only when protected', () => {
    fixture.detectChanges();
    const img = el().querySelector('img')!;
    expect(cancelled(img, 'contextmenu')).toBeTrue();
    expect(cancelled(img, 'dragstart')).toBeTrue();
    fixture.componentInstance.protect.set(false);
    fixture.detectChanges();
    expect(cancelled(img, 'contextmenu')).toBeFalse();
  });

  it('gives videos no download or picture-in-picture buttons when protected', () => {
    fixture.componentInstance.item.set({ small: 'clip.mp4', type: 'video', label: 'Clip' });
    fixture.componentInstance.playing.set(true);
    fixture.detectChanges();
    const video = el().querySelector('video')!;
    expect(video.getAttribute('controlslist')).toBe('nodownload noremoteplayback');
    expect(video.hasAttribute('disablepictureinpicture')).toBeTrue();
    expect(cancelled(video, 'contextmenu')).toBeTrue();
    fixture.componentInstance.protect.set(false);
    fixture.detectChanges();
    expect(video.hasAttribute('controlslist')).toBeFalse();
    expect(video.hasAttribute('disablepictureinpicture')).toBeFalse();
  });
});
