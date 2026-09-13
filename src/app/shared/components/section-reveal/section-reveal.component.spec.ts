import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionRevealComponent } from './section-reveal.component';

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

describe('SectionRevealComponent', () => {
  let fixture: ComponentFixture<SectionRevealComponent>;
  let component: SectionRevealComponent;
  let hostEl: HTMLElement;
  let captured: ObserverCallback | null;
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  // jsdom does not implement IntersectionObserver.
  function installFakeObserver(): void {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        root = null;
        rootMargin = '';
        thresholds: number[] = [];
        observe = observeSpy;
        disconnect = disconnectSpy;
        unobserve = vi.fn();
        takeRecords = (): IntersectionObserverEntry[] => [];

        constructor(cb: ObserverCallback) {
          captured = cb;
        }
      },
    );
  }

  function intersect(isIntersecting: boolean): void {
    captured!([{ isIntersecting } as IntersectionObserverEntry]);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    captured = null;
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();
    installFakeObserver();

    await TestBed.configureTestingModule({
      declarations: [SectionRevealComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionRevealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    hostEl = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('observes its own host element on init', () => {
    expect(observeSpy).toHaveBeenCalledWith(hostEl);
  });

  it('applies the reveal classes and defaults to the up direction', () => {
    expect(hostEl.classList.contains('reveal')).toBe(true);
    expect(hostEl.classList.contains('reveal--up')).toBe(true);
    expect(hostEl.classList.contains('revealed')).toBe(false);
  });

  it('reflects the direction input in the modifier class', () => {
    fixture.componentRef.setInput('direction', 'left');
    fixture.detectChanges();

    expect(hostEl.classList.contains('reveal--left')).toBe(true);
    expect(hostEl.classList.contains('reveal--up')).toBe(false);
  });

  it('reflects the delay input as an inline transition-delay', () => {
    fixture.componentRef.setInput('delay', 250);
    fixture.detectChanges();

    expect(hostEl.style.transitionDelay).toBe('250ms');
  });

  it('reveals once the element intersects the viewport', () => {
    intersect(true);

    expect(component.isRevealed).toBe(true);
    expect(hostEl.classList.contains('revealed')).toBe(true);
  });

  it('stays hidden while the element is not intersecting', () => {
    intersect(false);

    expect(component.isRevealed).toBe(false);
    expect(hostEl.classList.contains('revealed')).toBe(false);
    expect(disconnectSpy).not.toHaveBeenCalled();
  });

  it('disconnects after the first reveal so it only animates once', () => {
    intersect(true);

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('disconnects the observer on destroy', () => {
    disconnectSpy.mockClear();

    fixture.destroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('preserves a class a consumer put on the host element', () => {
    hostEl.classList.add('consumer-class');

    // Re-render the host bindings via an input change.
    fixture.componentRef.setInput('direction', 'left');
    fixture.detectChanges();

    expect(hostEl.classList.contains('consumer-class')).toBe(true);
    expect(hostEl.classList.contains('reveal')).toBe(true);
    expect(hostEl.classList.contains('reveal--left')).toBe(true);
  });
});
