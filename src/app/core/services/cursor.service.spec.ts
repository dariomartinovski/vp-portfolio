import { TestBed } from '@angular/core/testing';
import { CursorService } from './cursor.service';

describe('CursorService', () => {
  let service: CursorService;
  let rafCallback: FrameRequestCallback | null;
  let ctx: {
    clearRect: ReturnType<typeof vi.fn>;
    beginPath: ReturnType<typeof vi.fn>;
    moveTo: ReturnType<typeof vi.fn>;
    lineTo: ReturnType<typeof vi.fn>;
    stroke: ReturnType<typeof vi.fn>;
    strokeStyle: string;
    lineWidth: number;
    lineCap: string;
  };
  let getContextSpy: ReturnType<typeof vi.spyOn>;

  // jsdom has no canvas backend, so getContext('2d') returns null without a stub.
  // jsdom also reports itself as a touch device, so the desktop context the
  // pen cursor expects has to be established explicitly.
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>)['ontouchstart'];
    ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
    };
    rafCallback = null;
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        rafCallback = cb;
        return 1;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(ctx as unknown as CanvasRenderingContext2D);

    TestBed.configureTestingModule({});
    service = TestBed.inject(CursorService);
  });

  afterEach(() => {
    service.destroy();
    getContextSpy.mockRestore();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
    delete (window as unknown as Record<string, unknown>)['ontouchstart'];
  });

  function overlay() {
    const canvas = document.body.querySelector('canvas');
    const pen = canvas?.nextElementSibling as HTMLElement | null;
    return { canvas, pen };
  }

  it('appends a fixed, click-through canvas overlay and a pen nib element', () => {
    service.init();

    const { canvas, pen } = overlay();
    expect(canvas).toBeTruthy();
    expect(canvas!.style.position).toBe('fixed');
    expect(canvas!.style.pointerEvents).toBe('none');
    expect(canvas!.style.zIndex).toBe('9998');

    expect(pen).toBeTruthy();
    expect(pen!.style.zIndex).toBe('9999');
    expect(pen!.querySelector('svg')).toBeTruthy();
  });

  it('sizes the canvas backing store to the viewport', () => {
    service.init();

    const { canvas } = overlay();
    expect(canvas!.width).toBe(window.innerWidth);
    expect(canvas!.height).toBe(window.innerHeight);
  });

  it('creates no overlay on touch devices', () => {
    Object.defineProperty(window, 'ontouchstart', { value: null, configurable: true });

    service.init();

    expect(document.body.querySelector('canvas')).toBeNull();
  });

  it('moves the pen nib and draws a trail segment between mouse positions', () => {
    service.init();
    const { pen } = overlay();

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200 }));
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, clientY: 240 }));

    expect(pen!.style.left).toBe('140px');
    expect(pen!.style.top).toBe('240px');

    rafCallback!(0);

    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.strokeStyle).toMatch(/^rgba\(139, 187, 146, /);
  });

  it('caps the trail at MAX_TRAIL points', () => {
    service.init();

    for (let i = 0; i < 40; i++) {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: i, clientY: i }));
    }

    const trail = (service as unknown as { trail: unknown[] }).trail;
    expect(trail.length).toBe(14);
  });

  it('removes the overlay and listeners on destroy', () => {
    service.init();
    expect(document.body.querySelector('canvas')).toBeTruthy();

    service.destroy();

    expect(document.body.querySelector('canvas')).toBeNull();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
  });
});
