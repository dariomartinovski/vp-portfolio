import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { SectionRevealComponent } from '../../shared/components/section-reveal/section-reveal.component';
import { ArtworkCardComponent } from '../../shared/components/artwork-card/artwork-card.component';
import { SkillBadgeComponent } from '../../shared/components/skill-badge/skill-badge.component';
import { ContactFormComponent } from '../../shared/components/contact-form/contact-form.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ImageViewerComponent } from '../../shared/components/image-viewer/image-viewer.component';
import { SeoService } from '../../core/services/seo.service';
import { ScrollService } from '../../core/services/scroll.service';
import { LanguageService } from '../../core/services/language.service';
import { ARTWORKS } from '../../domain/const/artworks.const';
import { PERSON_NAME } from '../../domain/const/site.const';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let component: HomePage;
  let root: HTMLElement;
  let setHomeMeta: ReturnType<typeof vi.fn>;
  let scrollToSection: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  // jsdom viewport height; the service uses 35% and the page uses 30% of it.
  const VIEWPORT = 768;

  function queryAll(selector: string): HTMLElement[] {
    const nodes: NodeListOf<HTMLElement> = root.querySelectorAll(selector);
    return Array.from(nodes);
  }

  /** Positions the #about section so updateTimeline() computes a known value. */
  function positionAbout(top: number, height = 1000): void {
    const about = document.getElementById('about')!;
    Object.defineProperty(about, 'offsetHeight', { value: height, configurable: true });
    about.getBoundingClientRect = () =>
      ({ top, bottom: top + height, height, left: 0, right: 0, width: 0, x: 0, y: 0 }) as DOMRect;
  }

  function fireScroll(): void {
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    setHomeMeta = vi.fn();
    scrollToSection = vi.fn();

    // SectionRevealComponent constructs an IntersectionObserver, absent in jsdom.
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        root = null;
        rootMargin = '';
        thresholds: number[] = [];
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        takeRecords = (): IntersectionObserverEntry[] => [];
      },
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterModule.forRoot([]), TranslatePipe],
      declarations: [
        HomePage,
        SectionRevealComponent,
        ArtworkCardComponent,
        SkillBadgeComponent,
        ContactFormComponent,
        FooterComponent,
        ImageViewerComponent,
      ],
      providers: [
        { provide: SeoService, useValue: { setHomeMeta } },
        { provide: ScrollService, useValue: { scrollToSection } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;

    // updateTimeline() looks the section up via document.getElementById, so the
    // fixture has to actually be in the document.
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('sections', () => {
    it('renders all five sections with the ids ScrollService tracks', () => {
      const ids = queryAll('section').map((s) => s.id);

      expect(ids).toEqual(['home', 'featured', 'about', 'services', 'contact']);
    });

    it('renders the hero name, role and both CTAs', () => {
      expect(root.querySelector('.hero__name')?.textContent?.trim()).toBe(PERSON_NAME);
      expect(root.querySelector('.hero__title')?.textContent).toContain('Digital Illustrator');

      const ctas = queryAll('.hero__ctas .btn').map((b) => b.textContent?.trim());
      expect(ctas).toEqual(['See My Work', "Let's Talk"]);
    });

    it('labels the portrait with the designer name', () => {
      expect(root.querySelector('.about__image')?.getAttribute('alt')).toBe(component.portraitAlt);
    });

    it('localises the hero name and portrait alt in Macedonian', () => {
      TestBed.inject(LanguageService).setLanguage('mk');
      TestBed.inject(ApplicationRef).tick();

      expect(root.querySelector('.hero__name')?.textContent?.trim()).toBe('Роберт Мартиновски');
      expect(root.querySelector('.about__image')?.getAttribute('alt')).toBe(
        'Роберт Мартиновски - Илустратор',
      );
    });

    it('renders the footer exactly once', () => {
      expect(queryAll('app-footer').length).toBe(1);
    });
  });

  describe('featured work', () => {
    it('shows only the featured artworks', () => {
      const expected = ARTWORKS.filter((a) => a.featured);

      expect(component.featuredArtworks.length).toBe(expected.length);
      expect(component.featuredArtworks).toEqual(expected);
    });

    it('renders one card per featured artwork', () => {
      expect(queryAll('app-artwork-card').length).toBe(component.featuredArtworks.length);
    });

    it('opens the lightbox at the clicked artwork index', () => {
      const target = component.featuredArtworks[1];

      component.openViewer(target);
      fixture.detectChanges();

      expect(component.viewerIndex).toBe(1);
      expect(component.viewerVisible).toBe(true);
    });

    it('reports -1 and still opens when the artwork is not in the featured list', () => {
      component.openViewer(ARTWORKS.find((a) => !a.featured)!);

      expect(component.viewerIndex).toBe(-1);
      expect(component.viewerVisible).toBe(true);
    });

    it('closes the lightbox', () => {
      component.openViewer(component.featuredArtworks[0]);
      component.closeViewer();
      fixture.detectChanges();

      expect(component.viewerVisible).toBe(false);
    });
  });

  describe('about section', () => {
    it('renders every timeline milestone', () => {
      const items = queryAll('.timeline__item');
      const milestones = component.timelineMilestones;

      expect(items.length).toBe(milestones.length);
      expect(items[0].querySelector('.timeline__year')?.textContent).toBe(milestones[0].year);
      expect(items[items.length - 1].querySelector('.timeline__year')?.textContent).toBe(
        milestones[milestones.length - 1].year,
      );
    });

    it('renders one skill badge per technology', () => {
      expect(queryAll('app-skill-badge').length).toBe(component.technologies.length);
    });
  });

  describe('services section', () => {
    it('renders one card per service', () => {
      expect(queryAll('.service-card').length).toBe(component.allServices.length);
      expect(queryAll('.service-card')[0].querySelector('.service-card__title')?.textContent).toBe(
        'Digitalize Your Vision',
      );
    });
  });

  describe('contact section', () => {
    it('renders a social link per entry with safe target attributes', () => {
      const links = queryAll('.contact__social-link');

      expect(links.length).toBe(component.socialLinks.length);
      expect(links[0].getAttribute('href')).toBe(component.socialLinks[0].url);
      expect(links[0].getAttribute('target')).toBe('_blank');
      expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('embeds the contact form', () => {
      expect(queryAll('app-contact-form').length).toBe(1);
    });
  });

  describe('navigation', () => {
    it('delegates section scrolling to ScrollService', () => {
      root.querySelector<HTMLButtonElement>('.hero__ctas .btn')!.click();
      fixture.detectChanges();

      expect(scrollToSection).toHaveBeenCalledWith('featured');
    });

    it('routes to /work from the featured CTA', () => {
      component.goToWork();

      expect(navigateSpy).toHaveBeenCalledWith(['/work']);
    });
  });

  describe('timeline scroll progress', () => {
    it('computes progress from the about section position', () => {
      positionAbout(-500);

      fireScroll();

      // scrolled = 500 + 768 * 0.3 = 730.4 -> 73.04%
      expect(component.timelineProgress).toBeCloseTo(73.04, 2);
    });

    it('drives the progress bar and dot height/top styles', () => {
      positionAbout(-500);

      fireScroll();

      // Assert the binding propagated rather than re-deriving the arithmetic
      // (covered above), which is float-sensitive.
      const expected = `${component.timelineProgress}%`;
      const progress = root.querySelector<HTMLElement>('.timeline__progress')!;
      const dot = root.querySelector<HTMLElement>('.timeline__dot')!;
      expect(progress.style.height).toBe(expected);
      expect(dot.style.top).toBe(expected);
      expect(component.timelineProgress).toBeGreaterThan(0);
    });

    it('clamps to 0 before the section and 100 past it', () => {
      positionAbout(5000);
      fireScroll();
      expect(component.timelineProgress).toBe(0);

      positionAbout(-50000);
      fireScroll();
      expect(component.timelineProgress).toBe(100);
    });

    it('leaves progress untouched when the about section is absent', () => {
      document.getElementById('about')!.remove();

      fireScroll();

      expect(component.timelineProgress).toBe(0);
    });
  });

  describe('lifecycle', () => {
    it('sets the home SEO meta on init', () => {
      expect(setHomeMeta).toHaveBeenCalledTimes(1);
    });

    it('stops listening to scroll after destroy', () => {
      const removeEventListener = vi.spyOn(window, 'removeEventListener');

      fixture.destroy();

      expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });
});
