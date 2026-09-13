import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ARTIST_NAME, SITE_NAME } from '../../domain/const/site.const';
import { Artwork } from '../../domain/interfaces/artwork.interface';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly defaultDescription =
    'Digital illustration, brand identity, and visual design. Human-made artwork built with craft and intention.';
  private readonly defaultImage = 'assets/images/og-preview.jpg';

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  setHomeMeta(): void {
    this.title.setTitle(SITE_NAME);
    this.setMeta(SITE_NAME, this.defaultDescription, this.defaultImage);
  }

  setWorkMeta(): void {
    const t = 'Work - ' + SITE_NAME;
    this.title.setTitle(t);
    this.setMeta(
      t,
      'Browse the full portfolio - illustrations, branding, and visual design work.',
      this.defaultImage,
    );
  }

  updateForArtwork(artwork: Artwork): void {
    const t = artwork.title + ' - ' + SITE_NAME;
    this.title.setTitle(t);
    this.setMeta(t, artwork.description, artwork.src);
  }

  private setMeta(title: string, description: string, image: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:site_name', content: ARTIST_NAME });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
