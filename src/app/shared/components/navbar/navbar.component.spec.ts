import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ScrollService } from '../../../core/services/scroll.service';
import { LanguageService } from '../../../core/services/language.service';
import { ARTIST_NAME, PERSON_NAME } from '../../../domain/const/site.const';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;
  let activeSection$: BehaviorSubject<string>;
  let scrollToSection: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  /** `fixture.nativeElement` is loosely typed, so narrow the node list explicitly. */
  function queryAll(selector: string): HTMLElement[] {
    const nodes: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(selector);
    return Array.from(nodes);
  }

  function query(selector: string): HTMLElement {
    const node: HTMLElement | null = fixture.nativeElement.querySelector(selector);
    if (!node) throw new Error(`no element matched "${selector}"`);
    return node;
  }

  const linkLabels = (): string[] =>
    queryAll('.navbar__link').map((a) => (a.textContent ?? '').trim());

  beforeEach(async () => {
    activeSection$ = new BehaviorSubject<string>('home');
    scrollToSection = vi.fn();

    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), TranslatePipe],
      declarations: [NavbarComponent, LanguageToggleComponent],
      providers: [
        {
          provide: ScrollService,
          useValue: { activeSection$: activeSection$, scrollToSection },
        },
      ],
    }).compileComponents();

    // Stub navigation so tests never depend on a configured route table.
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.style.overflow = '';
    localStorage.clear();
  });

  describe('rendering', () => {
    it('shows the designer name in the logo', () => {
      expect(query('.navbar__logo-name').textContent?.trim()).toBe(PERSON_NAME);
    });

    it('shows the designer name in Macedonian when that language is active', () => {
      TestBed.inject(LanguageService).setLanguage('mk');
      TestBed.inject(ApplicationRef).tick();

      expect(query('.navbar__logo-name').textContent?.trim()).toBe('Роберт Мартиновски');
    });

    it('shows the artist alias as the logo subtitle', () => {
      expect(query('.navbar__logo-title').textContent?.trim()).toBe(ARTIST_NAME);
    });

    it('renders a desktop link for every nav item plus the all-work link', () => {
      expect(linkLabels().length).toBe(component.navItems.length + 1);
      expect(linkLabels()).toContain('All Work');
    });

    it('renders the same set of links in the mobile overlay', () => {
      const mobile = queryAll('.mobile-menu__link').map((a) => (a.textContent ?? '').trim());

      expect(mobile.length).toBe(component.navItems.length + 1);
    });
  });

  describe('active section highlighting', () => {
    it('highlights the link matching the published section', () => {
      activeSection$.next('about');
      // Bindings only re-render off a zone tick in this harness, so flush with a
      // real DOM event rather than relying on detectChanges() alone.
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      const links = queryAll('.navbar__link');
      const about = links.find((a) => a.textContent?.trim() === 'About');
      const home = links.find((a) => a.textContent?.trim() === 'Home');

      expect(about?.classList.contains('active')).toBe(true);
      expect(home?.classList.contains('active')).toBe(false);
    });

    it('highlights nothing once the user leaves the home page', () => {
      component.isHomePage = false;

      expect(component.isActive({ label: 'About', anchor: '#about' })).toBe(false);
    });

    it('never highlights the route-based work link', () => {
      expect(component.isActive({ label: 'All Work', route: '/work' })).toBe(false);
    });
  });

  describe('scrolled state', () => {
    it('applies the scrolled class past 60px', () => {
      vi.stubGlobal('scrollY', 61);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(component.isScrolled).toBe(true);
      expect(query('.navbar').classList.contains('scrolled')).toBe(true);
    });

    it('stays transparent at exactly 60px', () => {
      vi.stubGlobal('scrollY', 60);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(component.isScrolled).toBe(false);
    });
  });

  describe('navigate()', () => {
    it('scrolls to the section for an anchor on the home page', () => {
      component.navigate({ label: 'About', anchor: '#about' });

      expect(scrollToSection).toHaveBeenCalledWith('about');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('routes for an item that declares a route', () => {
      component.navigate({ label: 'All Work', route: '/work' });

      expect(navigateSpy).toHaveBeenCalledWith(['/work']);
      expect(scrollToSection).not.toHaveBeenCalled();
    });

    it('returns home first, then scrolls, when clicked from another page', async () => {
      component.isHomePage = false;

      component.navigate({ label: 'About', anchor: '#about' });

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
      expect(scrollToSection).not.toHaveBeenCalled();

      // navigate() defers the scroll by 100ms after the navigation promise resolves.
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(scrollToSection).toHaveBeenCalledWith('about');
    });

    it('does nothing for an item with neither route nor anchor', () => {
      component.navigate({ label: 'Nowhere' });

      expect(navigateSpy).not.toHaveBeenCalled();
      expect(scrollToSection).not.toHaveBeenCalled();
    });
  });

  describe('mobile menu', () => {
    it('opens and locks body scroll when the hamburger is clicked', () => {
      query('.navbar__hamburger').click();
      fixture.detectChanges();

      expect(component.isMobileMenuOpen).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
      expect(query('.mobile-menu').classList.contains('open')).toBe(true);
    });

    it('closes and releases body scroll on a second click', () => {
      query('.navbar__hamburger').click();
      query('.navbar__hamburger').click();
      fixture.detectChanges();

      expect(component.isMobileMenuOpen).toBe(false);
      expect(document.body.style.overflow).toBe('');
      expect(query('.mobile-menu').classList.contains('open')).toBe(false);
    });

    it('closes and scrolls when a link in the overlay is used', () => {
      query('.navbar__hamburger').click();
      fixture.detectChanges();
      expect(component.isMobileMenuOpen).toBe(true);

      const about = queryAll('.mobile-menu__link').find((a) => a.textContent?.trim() === 'About');
      expect(about).toBeTruthy();
      about!.click();
      fixture.detectChanges();

      expect(component.isMobileMenuOpen).toBe(false);
      expect(document.body.style.overflow).toBe('');
      expect(scrollToSection).toHaveBeenCalledWith('about');
      expect(query('.mobile-menu').classList.contains('open')).toBe(false);
    });
  });

  describe('teardown', () => {
    it('stops reacting to section changes after destroy', () => {
      fixture.destroy();

      activeSection$.next('contact');

      expect(component.activeSection).toBe('home');
    });
  });
});
