import { TestBed } from '@angular/core/testing';
import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
  let service: ScrollService;

  function addSection(id: string, top: number, bottom: number): HTMLElement {
    const el = document.createElement('section');
    el.id = id;
    el.getBoundingClientRect = () =>
      ({ top, bottom, height: bottom - top, left: 0, right: 0, width: 0, x: 0, y: 0 }) as DOMRect;
    document.body.appendChild(el);
    return el;
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
    const el = addSection('about', 0, 0);
    const scrollIntoView = vi.fn();
    el.scrollIntoView = scrollIntoView;

    service.scrollToSection('about');

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does nothing when the section id is not in the document', () => {
    expect(() => service.scrollToSection('missing')).not.toThrow();
  });

  it('publishes the section spanning the 35% viewport offset after scroll settles', () => {
    // jsdom window.innerHeight is 768, so the offset is ~269px.
    addSection('featured', 0, 500);

    vi.useFakeTimers();
    let current = '';
    service.activeSection$.subscribe((id) => (current = id));

    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(60);

    expect(current).toBe('featured');
  });
});
