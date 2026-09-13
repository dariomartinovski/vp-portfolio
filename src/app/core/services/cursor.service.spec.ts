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

  /**
   * jsdom does not implement matchMedia at all, so it has to be defined rather
   * than spied on. Real browsers have supported it since IE10.
   */
  function stubPointerFine(matches: boolean): void {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches }) as MediaQueryList),
    );
  }

  // jsdom has no canvas backend, so getContext('2d') returns null without a stub.
  beforeEach(() => {
    stubPointerFine(true);
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
  });

  /** Dispatches a bubbling mousemove so `event.target` is a real element. */
  function moveOver(target: EventTarget, x = 10, y = 10): void {
    target.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
  }

  function drawZone(innerHTML = ''): HTMLElement {
    const zone = document.createElement('div');
    zone.setAttribute('data-draw-zone', '');
    zone.innerHTML = innerHTML;
    document.body.appendChild(zone);
    return zone;
  }

  describe('canvas trail', () => {
    it('appends a fixed, click-through canvas overlay', () => {
      service.init();

      const canvas = document.body.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas!.style.position).toBe('fixed');
      expect(canvas!.style.pointerEvents).toBe('none');
      expect(canvas!.style.zIndex).toBe('9998');
    });

    it('sizes the canvas backing store to the viewport', () => {
      service.init();

      const canvas = document.body.querySelector('canvas')!;
      expect(canvas.width).toBe(window.innerWidth);
      expect(canvas.height).toBe(window.innerHeight);
    });

    it('creates no overlay when the primary pointer is coarse', () => {
      stubPointerFine(false);

      service.init();

      expect(document.body.querySelector('canvas')).toBeNull();
    });

    it('draws a trail segment between mouse positions', () => {
      service.init();

      moveOver(document.body, 100, 200);
      moveOver(document.body, 140, 240);
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
        moveOver(document.body, i, i);
      }

      const trail = (service as unknown as { trail: unknown[] }).trail;
      expect(trail.length).toBe(14);
    });

    it('removes the overlay and cancels the frame loop on destroy', () => {
      service.init();
      expect(document.body.querySelector('canvas')).toBeTruthy();

      service.destroy();

      expect(document.body.querySelector('canvas')).toBeNull();
      expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    });
  });

  describe('pen nib visibility', () => {
    beforeEach(() => service.init());

    it('stays hidden by default', () => {
      moveOver(document.body);

      expect(service.penActive()).toBe(false);
    });

    it('reveals the nib over a draw zone, including its descendants', () => {
      const zone = drawZone('<span class="child"></span>');

      moveOver(zone.querySelector('.child')!);

      expect(service.penActive()).toBe(true);
    });

    it('hides the nib again once the pointer leaves the draw zone', () => {
      const zone = drawZone();
      moveOver(zone);
      expect(service.penActive()).toBe(true);

      moveOver(document.body);

      expect(service.penActive()).toBe(false);
    });

    it('suppresses the nib over form fields inside a draw zone', () => {
      const zone = drawZone('<input type="text" /><textarea></textarea>');

      moveOver(zone.querySelector('input')!);
      expect(service.penActive()).toBe(false);

      moveOver(zone.querySelector('textarea')!);
      expect(service.penActive()).toBe(false);
    });

    it('ignores non-element targets such as window and document', () => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 5, clientY: 5 }));

      expect(service.penActive()).toBe(false);
    });
  });

  describe('pen element registration', () => {
    it('positions the registered element at the pointer', () => {
      service.init();
      const pen = document.createElement('div');
      service.registerPen(pen);

      moveOver(document.body, 120, 240);

      expect(pen.style.transform).toBe('translate3d(120px, 240px, 0)');
    });

    it('stops positioning after unregistering', () => {
      service.init();
      const pen = document.createElement('div');
      service.registerPen(pen);
      service.unregisterPen(pen);

      moveOver(document.body, 120, 240);

      expect(pen.style.transform).toBe('');
    });

    it('ignores an unregister call for a different element', () => {
      service.init();
      const pen = document.createElement('div');
      service.registerPen(pen);
      service.unregisterPen(document.createElement('div'));

      moveOver(document.body, 10, 20);

      expect(pen.style.transform).toBe('translate3d(10px, 20px, 0)');
    });

    it('survives mousemove before any pen is registered', () => {
      service.init();

      expect(() => moveOver(document.body, 10, 20)).not.toThrow();
    });
  });
});
