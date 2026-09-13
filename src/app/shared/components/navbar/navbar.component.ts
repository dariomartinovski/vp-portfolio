import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ScrollService } from '../../../core/services/scroll.service';
import { NAV_ITEMS, NAV_WORK_LINK } from '../../../domain/const/nav-items.const';
import { ARTIST_NAME, PERSON_NAME } from '../../../domain/const/site.const';
import { NavItem } from '../../../domain/interfaces/nav-item.interface';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly personName = PERSON_NAME;
  readonly artistName = ARTIST_NAME;
  navItems: NavItem[] = NAV_ITEMS;
  workLink = NAV_WORK_LINK;
  activeSection = 'home';
  isScrolled = false;
  isMobileMenuOpen = false;
  isHomePage = true;

  private subs = new Subscription();

  constructor(
    private scrollService: ScrollService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Track active section for highlight
    this.subs.add(
      this.scrollService.activeSection$.subscribe((section) => {
        this.activeSection = section;
      }),
    );

    // Track which page we are on
    this.subs.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => {
          this.isHomePage = e.urlAfterRedirects === '/';
          if (this.isMobileMenuOpen) this.closeMobileMenu();
        }),
    );

    this.isHomePage = this.router.url === '/';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 60;
  }

  navigate(item: NavItem): void {
    this.closeMobileMenu();
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.anchor) {
      const id = item.anchor.replace('#', '');
      if (!this.isHomePage) {
        // Navigate home first, then scroll after a short delay
        this.router.navigate(['/']).then(() => {
          setTimeout(() => this.scrollService.scrollToSection(id), 100);
        });
      } else {
        this.scrollService.scrollToSection(id);
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  isActive(item: NavItem): boolean {
    if (!this.isHomePage) return false;
    if (item.anchor) {
      return this.activeSection === item.anchor.replace('#', '');
    }
    return false;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
