import { TestBed } from '@angular/core/testing';
import { ScrollService } from './scroll.service';

interface Rect {
  top: number;
  bottom: number;
}

describe('ScrollService', () => {
  let service: ScrollService;

  /** Appends a section whose reported position can be moved later via `rect`. */
  function addSection(id: string, rect: Rect): HTMLElement {
    const el = document.createElement('section');
    el.id = id;
    el.getBoundingClientRect = () =>
      ({
        ...rect,
        height: rect.bottom - rect.top,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
      }) as DOMRect;
    document.body.appendChild(el);
    return el;
  }

  /** One scroll event per frame (~60fps), so no gap ever exceeds the 50ms window. */
  function scrollBurst(frames: number): void {
    for (let i = 0; i < frames; i++) {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(16);
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollService);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('exposes "home" as the initial active section', () => {
    let current = '';
    service.activeSection$.subscribe((id) => (current = id));
    expect(current).toBe('home');
  });

  it('smooth-scrolls to the element matching the section id', () => {
    const el = addSection('about', { top: 0, bottom: 0 });
    const scrollIntoView = vi.fn();
    el.scrollIntoView = scrollIntoView;

    service.scrollToSection('about');

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does nothing when the section id is not in the document', () => {
    expect(() => service.scrollToSection('missing')).not.toThrow();
  });

  it('publishes the section spanning the 35% viewport offset', () => {
    // jsdom window.innerHeight is 768, so the offset is ~269px.
    addSection('featured', { top: 0, bottom: 500 });

    vi.useFakeTimers();
    let current = '';
    service.activeSection$.subscribe((id) => (current = id));

    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(60);

    expect(current).toBe('featured');
  });

  it('keeps publishing during continuous scrolling, with no pause required', () => {
    const featured = { top: 0, bottom: 500 };
    const about = { top: 2000, bottom: 2500 };
    addSection('featured', featured);
    addSection('about', about);

    vi.useFakeTimers();
    const emissions: string[] = [];
    service.activeSection$.subscribe((id) => emissions.push(id));

    scrollBurst(10);
    expect(emissions).toEqual(['home', 'featured']);

    // Scroll on: 'featured' moves clear of the offset line, 'about' moves onto it.
    // debounceTime stays silent through an unbroken burst and would miss this.
    featured.top = -1000;
    featured.bottom = -500;
    about.top = 0;
    about.bottom = 500;

    scrollBurst(10);
    expect(emissions).toEqual(['home', 'featured', 'about']);
  });

  it('publishes each section once while it stays active', () => {
    addSection('featured', { top: 0, bottom: 500 });

    vi.useFakeTimers();
    const emissions: string[] = [];
    service.activeSection$.subscribe((id) => emissions.push(id));

    // ~6 audit windows, all resolving to the same section.
    scrollBurst(20);

    expect(emissions).toEqual(['home', 'featured']);
  });
});
