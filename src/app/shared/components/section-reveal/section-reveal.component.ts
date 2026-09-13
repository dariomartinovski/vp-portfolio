import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

type RevealDirection = 'up' | 'left' | 'right' | 'none';

@Component({
  selector: 'app-section-reveal',
  standalone: false,
  template: '<ng-content></ng-content>',
  styleUrl: './section-reveal.component.scss',
  // Individual class bindings rather than one interpolated `[class]` string, so
  // each modifier is tracked separately and the direction stays type-checked
  // against RevealDirection.
  host: {
    '[class.reveal]': 'true',
    '[class.reveal--up]': "direction === 'up'",
    '[class.reveal--left]': "direction === 'left'",
    '[class.reveal--right]': "direction === 'right'",
    '[class.reveal--none]': "direction === 'none'",
    '[class.revealed]': 'isRevealed',
    '[style.transition-delay]': "delay + 'ms'",
  },
})
export class SectionRevealComponent implements OnInit, OnDestroy {
  @Input() direction: RevealDirection = 'up';
  @Input() delay = 0; // milliseconds

  isRevealed = false;

  private observer!: IntersectionObserver;

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isRevealed = true;
          // IntersectionObserver fires outside Angular's event wrapping. This app
          // is zoneless and OnPush by default, so without markForCheck nothing
          // would schedule a render and the reveal would never appear.
          this.cdr.markForCheck();
          this.observer.disconnect(); // only animate once
        }
      },
      { threshold: 0.15 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
