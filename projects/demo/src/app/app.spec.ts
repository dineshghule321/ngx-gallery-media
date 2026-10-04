import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { EXAMPLES } from './examples';

describe('Demo App', () => {
  it('renders one card per example', () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('section.card').length).toBe(EXAMPLES.length);
    expect(el.querySelectorAll('.menu a').length).toBe(EXAMPLES.length);
  });
});
