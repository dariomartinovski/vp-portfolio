import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { Artwork } from '../../domain/interfaces/artwork.interface';
import { ARTIST_NAME } from '../../domain/const/site.const';

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;

  const content = (selector: string) => meta.getTag(selector)?.getAttribute('content');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [Title, Meta] });
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('sets the home title, description and social tags', () => {
    service.setHomeMeta();

    expect(title.getTitle()).toContain('Digital Illustrator & Designer');
    expect(content('name="description"')).toContain('Human-made artwork');
    expect(content('property="og:title"')).toContain('Digital Illustrator');
    expect(content('property="og:image"')).toBe('assets/images/og-preview.jpg');
    expect(content('property="og:site_name"')).toBe(ARTIST_NAME);
    expect(content('name="twitter:card"')).toBe('summary_large_image');
  });

  it('prefixes the work page title', () => {
    service.setWorkMeta();

    expect(title.getTitle()).toMatch(/^Work — /);
    expect(content('property="og:description"')).toContain('Browse the full portfolio');
  });

  it('uses the artwork title, description and image', () => {
    const artwork: Artwork = {
      id: '1',
      title: 'Forest Spirit',
      category: 'illustration',
      description: 'A digital illustration exploring nature and mysticism.',
      tags: ['nature'],
      src: 'assets/images/artworks/forest-spirit.jpg',
      thumbnail: 'assets/images/thumbnails/forest-spirit.webp',
      featured: true,
      year: 2024,
    };

    service.updateForArtwork(artwork);

    expect(title.getTitle()).toContain('Forest Spirit');
    expect(content('name="description"')).toBe(artwork.description);
    expect(content('property="og:image"')).toBe(artwork.src);
  });

  it('overwrites rather than duplicates tags on repeated calls', () => {
    service.setHomeMeta();
    service.setWorkMeta();

    expect(meta.getTags('name="description"').length).toBe(1);
    expect(title.getTitle()).toMatch(/^Work — /);
  });
});
