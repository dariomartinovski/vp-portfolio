import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ScrollService } from '../../core/services/scroll.service';
import { ARTWORKS } from '../../domain/const/artworks.const';
import { SERVICES } from '../../domain/const/services.const';
import { PERSON_NAME } from '../../domain/const/site.const';
import { SOCIAL_LINKS } from '../../domain/const/social-links.const';
import { TECHNOLOGIES } from '../../domain/const/technologies.const';
import { Artwork } from '../../domain/interfaces/artwork.interface';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit, OnDestroy {
  readonly personName = PERSON_NAME;
  readonly portraitAlt = `${PERSON_NAME} - Illustrator`;

  featuredArtworks: Artwork[] = ARTWORKS.filter((a) => a.featured);
  allServices = SERVICES;
  technologies = TECHNOLOGIES;
  socialLinks = SOCIAL_LINKS;

  // Lightbox state
  viewerVisible = false;
  viewerIndex = 0;

  // Timeline scroll
  timelineProgress = 0;
  private scrollHandler = () => this.updateTimeline();

  timelineMilestones = [
    {
      year: '~2010',
      label: 'Pencil meets paper',
      description:
        'Drawing became a constant from an early age - characters, creatures, worlds pulled straight from imagination.',
    },
    {
      year: '2013',
      label: 'High school, full obsession',
      description:
        "Art took over in high school. Sketchbooks everywhere, fantasy worlds, characters - it was clear this wasn't just a hobby.",
    },
    {
      year: '2017',
      label: 'First illustration work',
      description:
        'Started producing illustrations for educational and promotional materials at International Slavic University.',
    },
    {
      year: '2024',
      label: 'Editor, cartoonist, illustrator',
      description:
        'Creating illustrations and caricatures for publications, collaborating with authors and academic staff on real publishing projects.',
    },
    {
      year: 'Now',
      label: 'Building something of my own',
      description:
        "Freelancing, illustrating, and designing - doing what I've always done, but on my own terms.",
    },
  ];

  constructor(
    private seoService: SeoService,
    private scrollService: ScrollService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.seoService.setHomeMeta();
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  scrollTo(sectionId: string): void {
    this.scrollService.scrollToSection(sectionId);
  }

  goToWork(): void {
    this.router.navigate(['/work']);
  }

  openViewer(artwork: Artwork): void {
    this.viewerIndex = this.featuredArtworks.indexOf(artwork);
    this.viewerVisible = true;
  }

  closeViewer(): void {
    this.viewerVisible = false;
  }

  private updateTimeline(): void {
    const section = document.getElementById('about');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const scrolled = -rect.top + window.innerHeight * 0.3;
    this.timelineProgress = Math.min(100, Math.max(0, (scrolled / sectionHeight) * 100));
    // This is a raw addEventListener callback, not an Angular-managed event, so
    // the zoneless scheduler is never notified. Without markForCheck the
    // timeline progress bar and dot would never move.
    this.cdr.markForCheck();
  }
}
