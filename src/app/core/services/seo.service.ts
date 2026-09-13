import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Artwork } from '../../domain/interfaces/artwork.interface';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'Your Name — Digital Illustrator & Designer';
  private readonly defaultDescription =
    'Digital illustration, brand identity, and visual design. Human-made artwork built with craft and intention.';
  private readonly defaultImage = 'assets/images/og-preview.jpg';

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  setHomeMeta(): void {
    this.title.setTitle(this.siteName);
    this.setMeta(this.siteName, this.defaultDescription, this.defaultImage);
  }

  setWorkMeta(): void {
    const t = 'Work — ' + this.siteName;
    this.title.setTitle(t);
    this.setMeta(
      t,
      'Browse the full portfolio — illustrations, branding, and visual design work.',
      this.defaultImage,
    );
  }

  updateForArtwork(artwork: Artwork): void {
    const t = artwork.title + ' — ' + this.siteName;
    this.title.setTitle(t);
    this.setMeta(t, artwork.description, artwork.src);
  }

  private setMeta(title: string, description: string, image: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
