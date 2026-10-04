import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Names of the built-in icons. */
export type NgmIconName =
  | 'prev'
  | 'next'
  | 'close'
  | 'fullscreen'
  | 'exitFullscreen'
  | 'zoomIn'
  | 'zoomOut'
  | 'rotateLeft'
  | 'rotateRight'
  | 'download'
  | 'play'
  | 'spinner'
  | 'broken';

const PATHS: Record<NgmIconName, string> = {
  prev: 'M15 18l-6-6 6-6',
  next: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  exitFullscreen: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
  zoomIn: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4M11 8v6M8 11h6',
  zoomOut: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4M8 11h6',
  rotateLeft: 'M4 4v6h6M5.6 15a7.5 7.5 0 1 0 1.8-7.8L4 10',
  rotateRight: 'M20 4v6h-6M18.4 15a7.5 7.5 0 1 1-1.8-7.8L20 10',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  play: 'M12 2.5a9.5 9.5 0 1 0 0 19a9.5 9.5 0 1 0 0-19zM10 8.5l5.5 3.5-5.5 3.5z',
  spinner: 'M12 3a9 9 0 1 0 9 9',
  broken: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9h.01',
};

/** An icon: the icon-font class when given, else the built-in SVG. Decorative (hidden from screen readers). */
@Component({
  selector: 'ngm-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'ngm-icon' },
  styles: `
    :host {
      display: inline-flex;
      line-height: 1;
    }
    svg {
      width: 1em;
      height: 1em;
    }
    .spin {
      animation: ngm-spin 0.9s linear infinite;
    }
    @keyframes ngm-spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spin {
        animation-duration: 2.5s;
      }
    }
  `,
  template: `
    @if (cssClass(); as c) {
      <i [class]="c"></i>
    } @else {
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
        [class.spin]="name() === 'spinner'"
      >
        <path
          [attr.d]="path()"
          [attr.fill]="name() === 'play' ? 'currentColor' : 'none'"
          [attr.fill-rule]="'evenodd'"
        />
      </svg>
    }
  `,
})
export class NgmIconComponent {
  readonly name = input.required<NgmIconName>();
  /** Icon-font class(es); wins over the built-in icon. */
  readonly cssClass = input<string | null | undefined>(null);
  readonly path = computed(() => PATHS[this.name()]);
}
