import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { fill } from './helpers';
import { NgmGalleryAction } from './models';

/** Custom buttons (image, thumbnail or preview actions). */
@Component({
  selector: 'ngm-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ngm-actions' },
  styles: `
    :host {
      display: inline-flex;
      gap: 0.25rem;
    }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      padding: 0 0.375rem;
      border: 0;
      border-radius: var(--ngm-radius, var(--bs-border-radius, 0.375rem));
      background: var(--ngm-control-bg, rgba(0, 0, 0, 0.5));
      color: var(--ngm-control-color, #fff);
      font-size: 1.125rem;
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      background: var(--ngm-control-bg-hover, rgba(0, 0, 0, 0.75));
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    button:focus-visible {
      outline: 2px solid var(--ngm-focus, #fff);
      outline-offset: 2px;
    }
  `,
  template: `
    @for (a of actions(); track $index) {
      <button
        type="button"
        [disabled]="a.disabled"
        [attr.aria-label]="a.titleText"
        [title]="a.titleText"
        (click)="run(a, $event)"
      >
        <i [class]="a.icon" aria-hidden="true"></i>
      </button>
    }
  `,
})
export class NgmActionsComponent {
  readonly actions = input<NgmGalleryAction[]>([]);
  readonly index = input(0);

  run(a: NgmGalleryAction, e: Event): void {
    e.stopPropagation();
    if (!a.disabled) a.onClick(e, this.index());
  }
}

/** Dots, one per item; the current one is filled. */
@Component({
  selector: 'ngm-bullets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ngm-bullets' },
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.375rem;
    }
    button {
      width: 0.75rem;
      height: 0.75rem;
      padding: 0;
      border: 2px solid var(--ngm-bullet-color, #fff);
      border-radius: 50%;
      background: transparent;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
      cursor: pointer;
    }
    button.active {
      background: var(--ngm-bullet-color, #fff);
    }
    button:focus-visible {
      outline: 2px solid var(--ngm-focus, #fff);
      outline-offset: 2px;
    }
  `,
  template: `
    @for (b of dots(); track b) {
      <button
        type="button"
        [class.active]="b === active()"
        [attr.aria-current]="b === active() ? 'true' : null"
        [attr.aria-label]="label(b)"
        (click)="$event.stopPropagation(); pick.emit(b)"
      ></button>
    }
  `,
})
export class NgmBulletsComponent {
  readonly count = input(0);
  readonly active = input(0);
  /** Label with `{n}` and `{total}`. */
  readonly labelText = input('{n} / {total}');
  readonly pick = output<number>();

  readonly dots = computed(() => Array.from({ length: this.count() }, (_, i) => i));

  label(i: number): string {
    return fill(this.labelText(), { n: i + 1, total: this.count() });
  }
}
