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
