import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { SeoService } from '../../core/services/seo.service';
import { ARTWORKS } from '../../domain/const/artworks.const';
import { Artwork } from '../../domain/interfaces/artwork.interface';

type ArtworkCategory = 'all' | 'illustration' | 'branding' | 'ui' | 'print';

interface FilterTab {
  label: string;
  value: ArtworkCategory;
  count: number;
}

@Component({
  selector: 'app-work',
  standalone: false,
  templateUrl: './work.page.html',
  styleUrl: './work.page.scss',
  animations: [
    trigger('gridAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(24px)' }),
            stagger(60, [
              animate(
                '400ms cubic-bezier(0.4, 0, 0.2, 1)',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class WorkPage implements OnInit, OnDestroy {
  allArtworks: Artwork[] = ARTWORKS;
  filteredArtworks: Artwork[] = ARTWORKS;
  activeFilter: ArtworkCategory = 'all';

  // Lightbox state
  viewerVisible = false;
  viewerIndex = 0;

  // For animation trigger - change key to retrigger
  animationState = 0;

  filterTabs: FilterTab[] = [
    { label: 'All', value: 'all', count: 0 },
    { label: 'Illustration', value: 'illustration', count: 0 },
    { label: 'Branding', value: 'branding', count: 0 },
    { label: 'UI Design', value: 'ui', count: 0 },
    { label: 'Print', value: 'print', count: 0 },
  ];

  constructor(
    private seoService: SeoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.seoService.setWorkMeta();
    this.buildFilterCounts();
  }

  ngOnDestroy(): void {}

  private buildFilterCounts(): void {
    this.filterTabs = this.filterTabs.map((tab) => ({
      ...tab,
      count:
        tab.value === 'all'
          ? this.allArtworks.length
          : this.allArtworks.filter((a) => a.category === tab.value).length,
    }));
    // Remove tabs with 0 items (except 'all')
    this.filterTabs = this.filterTabs.filter((t) => t.value === 'all' || t.count > 0);
  }

  setFilter(filter: ArtworkCategory): void {
    if (this.activeFilter === filter) return;
    this.activeFilter = filter;
    this.animationState++;

    if (filter === 'all') {
      this.filteredArtworks = [...this.allArtworks];
    } else {
      this.filteredArtworks = this.allArtworks.filter((a) => a.category === filter);
    }
  }

  openViewer(artwork: Artwork): void {
    this.viewerIndex = this.filteredArtworks.indexOf(artwork);
    this.viewerVisible = true;
  }

  closeViewer(): void {
    this.viewerVisible = false;
    this.seoService.setWorkMeta();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  trackByArtwork(index: number, artwork: Artwork): string {
    return artwork.id;
  }
}
