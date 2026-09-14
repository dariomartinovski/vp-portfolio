import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerComponent } from './image-viewer.component';
import { SeoService } from '../../../core/services/seo.service';
import { Artwork } from '../../../domain/interfaces/artwork.interface';

describe('ImageViewerComponent', () => {
  let fixture: ComponentFixture<ImageViewerComponent>;
  let component: ImageViewerComponent;
  let root: HTMLElement;
  let updateForArtwork: ReturnType<typeof vi.fn>;
  let closedSpy: ReturnType<typeof vi.fn>;

  const artworks: Artwork[] = [
    {
      id: '1',
      title: 'Forest Spirit',
      category: 'illustration',
      description: 'First description.',
      tags: ['nature'],
      src: 'assets/images/artworks/forest-spirit.jpg',
      thumbnail: 'assets/images/thumbnails/forest-spirit.webp',
      featured: true,
      year: 2024,
    },
    {
      id: '2',
      title: 'Urban Bloom',
      category: 'illustration',
      description: 'Second description.',
      tags: ['urban', 'color'],
      src: 'assets/images/artworks/urban-bloom.jpg',
      thumbnail: 'assets/images/thumbnails/urban-bloom.webp',
      featured: true,
      year: 2024,
    },
  ];

  const viewer = (): HTMLElement => root.querySelector('.viewer')!;
  const key = (k: string): void => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
    fixture.detectChanges();
  };

  async function open(): Promise<void> {
    fixture.componentRef.setInput('artworks', artworks);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    updateForArtwork = vi.fn();
    await TestBed.configureTestingModule({
      declarations: [ImageViewerComponent],
      providers: [{ provide: SeoService, useValue: { updateForArtwork } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewerComponent);
    component = fixture.componentInstance;
    closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('navigation bounds', () => {
    it('reports no previous on the first artwork and no next on the last', async () => {
      await open();
      expect(component.hasPrev).toBe(false);
      expect(component.hasNext).toBe(true);

      fixture.componentRef.setInput('currentIndex', 1);
      fixture.detectChanges();
      expect(component.hasPrev).toBe(true);
      expect(component.hasNext).toBe(false);
    });

    it('advances and rewinds within bounds only', async () => {
      await open();

      component.prev();
      expect(component.currentIndex).toBe(0);

      component.next();
      expect(component.currentIndex).toBe(1);

      component.next();
      expect(component.currentIndex).toBe(1);
    });

    it('returns undefined for current when the list is empty', () => {
      expect(component.current).toBeUndefined();
    });
  });

  describe('rendering', () => {
    it('renders nothing meaningful while closed', () => {
      fixture.detectChanges();

      expect(viewer().classList.contains('open')).toBe(false);
      expect(root.querySelector('.viewer__content')).toBeNull();
    });

    it('renders the current artwork details when open', async () => {
      await open();

      expect(viewer().classList.contains('open')).toBe(true);
      expect(root.querySelector('.viewer__title')?.textContent?.trim()).toBe('Forest Spirit');
      expect(root.querySelector('.viewer__description')?.textContent?.trim()).toBe(
        'First description.',
      );
      expect(root.querySelector('.viewer__image')!.getAttribute('src')).toBe(artworks[0].src);
    });

    it('renders one tag chip per tag', async () => {
      await open();
      fixture.componentRef.setInput('currentIndex', 1);
      fixture.detectChanges();

      const tags = Array.from(root.querySelectorAll('.viewer__tag')).map((t) =>
        t.textContent?.trim(),
      );
      expect(tags).toEqual(['#urban', '#color']);
    });

    it('shows the counter only when there is more than one artwork', async () => {
      await open();
      expect(root.querySelector('.viewer__counter')?.textContent).toContain('1 / 2');

      fixture.componentRef.setInput('artworks', [artworks[0]]);
      fixture.detectChanges();
      expect(root.querySelector('.viewer__counter')).toBeNull();
    });

    it('marks the image hidden until it has loaded', async () => {
      await open();
      const image = root.querySelector('.viewer__image') as HTMLImageElement;
      expect(image.classList.contains('visible')).toBe(false);

      image.dispatchEvent(new Event('load'));
      fixture.detectChanges();

      expect(component.isImageLoaded).toBe(true);
      expect(image.classList.contains('visible')).toBe(true);
    });

    it('resets the loaded state when moving to the next artwork', async () => {
      await open();
      (root.querySelector('.viewer__image') as HTMLImageElement).dispatchEvent(new Event('load'));
      fixture.detectChanges();
      expect(component.isImageLoaded).toBe(true);

      component.next();
      fixture.detectChanges();

      expect(component.isImageLoaded).toBe(false);
    });
  });

  describe('image loading', () => {
    const image = (): HTMLImageElement => root.querySelector('.viewer__image')!;

    /** jsdom never fetches images, so model a browser-cached image manually. */
    function markComplete(): void {
      Object.defineProperty(image(), 'complete', { value: true, configurable: true });
      Object.defineProperty(image(), 'naturalWidth', { value: 800, configurable: true });
    }

    it('reveals an already-cached image without waiting for a load event', async () => {
      fixture.componentRef.setInput('artworks', artworks);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      // Synchronous, so it lands before the completeness microtask runs.
      markComplete();
      await Promise.resolve();
      fixture.detectChanges();

      expect(image().classList.contains('visible')).toBe(true);
    });

    it('stays hidden until load fires when the image is not yet complete', async () => {
      fixture.componentRef.setInput('artworks', artworks);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      await Promise.resolve();
      fixture.detectChanges();
      expect(image().classList.contains('visible')).toBe(false);

      image().dispatchEvent(new Event('load'));
      fixture.detectChanges();

      expect(image().classList.contains('visible')).toBe(true);
    });

    it('shows the image again when the same artwork is reopened', async () => {
      fixture.componentRef.setInput('artworks', artworks);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      markComplete();
      await Promise.resolve();
      fixture.detectChanges();
      expect(image().classList.contains('visible')).toBe(true);

      // Close, then reopen the same artwork: src is unchanged, so no load fires.
      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      markComplete();
      await Promise.resolve();
      fixture.detectChanges();

      expect(image().classList.contains('visible')).toBe(true);
    });
  });

  describe('body scroll lock', () => {
    it('locks body scroll on open', async () => {
      await open();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('releases body scroll on close', async () => {
      await open();

      component.close();

      expect(document.body.style.overflow).toBe('');
      expect(closedSpy).toHaveBeenCalled();
    });

    it('releases body scroll when the parent hides the viewer without calling close()', async () => {
      await open();
      expect(document.body.style.overflow).toBe('hidden');

      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('');
    });

    it('releases body scroll on destroy even if never closed', async () => {
      await open();

      fixture.destroy();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('keyboard', () => {
    it('moves next on ArrowRight and prev on ArrowLeft', async () => {
      await open();

      key('ArrowRight');
      expect(component.currentIndex).toBe(1);

      key('ArrowLeft');
      expect(component.currentIndex).toBe(0);
    });

    it('closes on Escape', async () => {
      await open();

      key('Escape');

      expect(closedSpy).toHaveBeenCalled();
      expect(document.body.style.overflow).toBe('');
    });

    it('ignores keys while closed', async () => {
      fixture.componentRef.setInput('artworks', artworks);
      fixture.detectChanges();

      key('ArrowRight');

      expect(component.currentIndex).toBe(0);
    });
  });

  describe('pointer and touch', () => {
    it('closes when the backdrop itself is clicked', async () => {
      await open();

      viewer().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(closedSpy).toHaveBeenCalled();
    });

    it('does not close when a child of the backdrop is clicked', async () => {
      await open();

      root
        .querySelector('.viewer__title')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('advances on a left swipe and rewinds on a right swipe', async () => {
      await open();

      const swipe = (from: number, to: number): void => {
        viewer().dispatchEvent(
          Object.assign(new Event('touchstart'), { touches: [{ clientX: from }] }),
        );
        viewer().dispatchEvent(
          Object.assign(new Event('touchend'), { changedTouches: [{ clientX: to }] }),
        );
        fixture.detectChanges();
      };

      swipe(300, 100); // delta +200 -> next
      expect(component.currentIndex).toBe(1);

      swipe(100, 300); // delta -200 -> prev
      expect(component.currentIndex).toBe(0);
    });

    it('ignores swipes shorter than the 50px threshold', async () => {
      await open();

      viewer().dispatchEvent(
        Object.assign(new Event('touchstart'), { touches: [{ clientX: 300 }] }),
      );
      viewer().dispatchEvent(
        Object.assign(new Event('touchend'), { changedTouches: [{ clientX: 280 }] }),
      );
      fixture.detectChanges();

      expect(component.currentIndex).toBe(0);
    });
  });

  describe('seo', () => {
    it('updates meta on open and on each navigation step', async () => {
      await open();
      expect(updateForArtwork).toHaveBeenCalledWith(artworks[0]);

      component.next();
      expect(updateForArtwork).toHaveBeenLastCalledWith(artworks[1]);
    });
  });

  describe('accessibility', () => {
    /** Mirrors the component's own filter so the expected order is explicit. */
    const tabbables = (): HTMLElement[] =>
      Array.from(root.querySelectorAll<HTMLElement>('.viewer button')).filter(
        (b) => !b.classList.contains('hidden'),
      );

    const pressTab = (shiftKey = false): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
      document.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };

    it('labels the dialog with the current artwork title', async () => {
      await open();

      expect(viewer().getAttribute('aria-label')).toBe('Forest Spirit, artwork viewer');
      expect(viewer().getAttribute('role')).toBe('dialog');
      expect(viewer().getAttribute('aria-modal')).toBe('true');
    });

    it('falls back to a generic label when there is no artwork', () => {
      fixture.detectChanges();

      expect(viewer().getAttribute('aria-label')).toBe('Artwork viewer');
    });

    it('marks the unavailable arrow out of the tab order', async () => {
      await open();

      const prev = root.querySelector('.viewer__arrow--prev')!;
      expect(prev.classList.contains('hidden')).toBe(true);
      expect(prev.getAttribute('tabindex')).toBe('-1');
      expect(tabbables().length).toBe(2); // close + next
    });

    it('moves focus into the dialog on open', async () => {
      await open();
      await Promise.resolve();

      expect(document.activeElement).toBe(root.querySelector('.viewer__close'));
    });

    it('restores focus to the previously focused element on close', async () => {
      const outside = document.createElement('button');
      document.body.appendChild(outside);
      outside.focus();

      await open();
      await Promise.resolve();
      expect(document.activeElement).not.toBe(outside);

      component.close();
      expect(document.activeElement).toBe(outside);

      outside.remove();
    });

    it('wraps Tab forward from the last control back to the first', async () => {
      await open();
      await Promise.resolve();

      const controls = tabbables();
      controls[controls.length - 1].focus();

      const event = pressTab();

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(controls[0]);
    });

    it('wraps Shift+Tab backward from the first control to the last', async () => {
      await open();
      await Promise.resolve();

      const controls = tabbables();
      controls[0].focus();

      const event = pressTab(true);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(controls[controls.length - 1]);
    });

    it('leaves Tab alone between the first and last control', async () => {
      await open();
      await Promise.resolve();

      const controls = tabbables();
      controls[0].focus();

      const event = pressTab();

      expect(event.defaultPrevented).toBe(false);
    });

    it('pulls focus back into the dialog when Tab is pressed from outside it', async () => {
      // document.body is not focusable in jsdom, so use a real outside control.
      const outside = document.createElement('button');
      document.body.appendChild(outside);

      await open();
      await Promise.resolve();

      outside.focus();
      expect(document.activeElement).toBe(outside);

      const event = pressTab();

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(tabbables()[0]);

      outside.remove();
    });
  });
});
