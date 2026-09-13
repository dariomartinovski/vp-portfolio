import { Injectable, NgZone } from '@angular/core';

interface TrailPoint {
  x: number;
  y: number;
  age: number; // 0 = newest, increases each frame
}

@Injectable({ providedIn: 'root' })
export class CursorService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private trail: TrailPoint[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private penEl!: HTMLElement;
  private animFrameId!: number;
  private readonly MAX_TRAIL = 14;
  private readonly MAX_AGE = 18;

  constructor(private ngZone: NgZone) {}

  init(): void {
    if ('ontouchstart' in window) return; // disable on touch

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

    // Create pen nib element
    this.penEl = document.createElement('div');
    this.penEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="#8BBB92" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="#8BBB92"
              stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 2l7.586 7.586" stroke="#8BBB92" stroke-width="1.5"
              stroke-linecap="round"/>
        <circle cx="11" cy="11" r="2" stroke="#8BBB92" stroke-width="1.5"/>
      </svg>`;
    this.penEl.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-4px, -18px);
      transition: opacity 200ms ease;
    `;
    document.body.appendChild(this.penEl);

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('resize', this.resizeCanvas);
      this.animate();
    });
  }

  destroy(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.resizeCanvas);
    cancelAnimationFrame(this.animFrameId);
    this.canvas?.remove();
    this.penEl?.remove();
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.penEl.style.left = e.clientX + 'px';
    this.penEl.style.top = e.clientY + 'px';

    this.trail.unshift({ x: e.clientX, y: e.clientY, age: 0 });
    if (this.trail.length > this.MAX_TRAIL) {
      this.trail.pop();
    }
  };

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
