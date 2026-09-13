import { Injectable, NgZone, signal } from '@angular/core';

interface TrailPoint {
  x: number;
  y: number;
  age: number; // 0 = newest, increases each frame
}

/**
 * Elements inside a draw zone show the pen nib. Mark a host with
 * `data-draw-zone` (see ArtworkCardComponent) to opt it in.
 */
export const DRAW_ZONE_SELECTOR = '[data-draw-zone]';

/** The nib is always suppressed over text entry, whatever zone it sits in. */
const FORM_FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

@Injectable({ providedIn: 'root' })
export class CursorService {
  /**
   * Whether the pen nib should be visible. Flips only when the pointer crosses
   * a zone boundary, so it is cheap to read from a binding - unlike the
   * position, which is written straight to the DOM on every mousemove.
   */
  readonly penActive = signal(false);

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private trail: TrailPoint[] = [];
  private penEl: HTMLElement | null = null;
  private animFrameId!: number;
  private readonly MAX_TRAIL = 14;
  private readonly MAX_AGE = 18;

  constructor(private ngZone: NgZone) {}

  init(): void {
    // `pointer: fine` matches mouse/trackpad as the primary input, including on
    // touch-capable laptops. `'ontouchstart' in window` also matches those, which
    // would silently disable the effect for users who do have a pointer.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Create canvas overlay
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('resize', this.resizeCanvas);
      this.animate();
    });
  }

  /** Called by PenCursorComponent once its host element exists. */
  registerPen(el: HTMLElement): void {
    this.penEl = el;
  }

  unregisterPen(el: HTMLElement): void {
    if (this.penEl === el) {
      this.penEl = null;
    }
  }

  destroy(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.resizeCanvas);
    cancelAnimationFrame(this.animFrameId);
    this.canvas?.remove();
    this.penEl = null;
    this.trail = [];
    this.ngZone.run(() => this.penActive.set(false));
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (this.penEl) {
      this.penEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }

    const active = this.isDrawZone(e.target);
    if (active !== this.penActive()) {
      this.ngZone.run(() => this.penActive.set(active));
    }

    this.trail.unshift({ x: e.clientX, y: e.clientY, age: 0 });
    if (this.trail.length > this.MAX_TRAIL) {
      this.trail.pop();
    }
  };

  private isDrawZone(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    if (target.closest(FORM_FIELD_SELECTOR)) return false;
    return target.closest(DRAW_ZONE_SELECTOR) !== null;
  }

  private resizeCanvas = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.trail.length - 1; i++) {
      const p1 = this.trail[i];
      const p2 = this.trail[i + 1];
      const opacity = Math.max(0, 1 - p1.age / this.MAX_AGE);

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.strokeStyle = `rgba(139, 187, 146, ${opacity * 0.7})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();

      p1.age++;
    }

    // Remove dead points
    this.trail = this.trail.filter((p) => p.age < this.MAX_AGE);
  };
}
