import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtworkCardComponent } from './artwork-card.component';
import { Artwork } from '../../../domain/interfaces/artwork.interface';

describe('ArtworkCardComponent', () => {
  let fixture: ComponentFixture<ArtworkCardComponent>;
  let component: ArtworkCardComponent;
  let root: HTMLElement;

  const artwork: Artwork = {
    id: '1',
    title: 'Forest Spirit',
    category: 'illustration',
    description: 'A digital illustration exploring nature and mysticism.',
    tags: ['nature', 'character'],
    src: 'assets/images/artworks/forest-spirit.jpg',
    thumbnail: 'assets/images/thumbnails/forest-spirit.webp',
    featured: true,
    year: 2024,
  };

  const image = (): HTMLImageElement | null => root.querySelector('.card__image');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArtworkCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtworkCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('artwork', artwork);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('renders the thumbnail with the title as alt text', () => {
    expect(image()!.getAttribute('src')).toBe(artwork.thumbnail);
    expect(image()!.getAttribute('alt')).toBe(artwork.title);
    expect(image()!.getAttribute('loading')).toBe('lazy');
  });

  it('renders the category, title and year in the overlay', () => {
    expect(root.querySelector('.card__category')?.textContent?.trim()).toBe('illustration');
    expect(root.querySelector('.card__title')?.textContent?.trim()).toBe('Forest Spirit');
    expect(root.querySelector('.card__year')?.textContent?.trim()).toBe('2024');
  });

  it('shows the skeleton and hides the image before load', () => {
    expect(root.querySelector('.card__skeleton')!.classList.contains('hidden')).toBe(false);
    expect(image()!.classList.contains('visible')).toBe(false);
  });

  it('hides the skeleton and reveals the image once it loads', () => {
    image()!.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(component.isLoaded).toBe(true);
    expect(root.querySelector('.card__skeleton')!.classList.contains('hidden')).toBe(true);
    expect(image()!.classList.contains('visible')).toBe(true);
  });

  it('replaces the image with a fallback and clears the skeleton on error', () => {
    image()!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isLoaded).toBe(true);
    expect(root.querySelector('.card__error')?.textContent).toContain('Image unavailable');
    expect(image()).toBeNull();
    expect(root.querySelector('.card__skeleton')!.classList.contains('hidden')).toBe(true);
  });

  it('emits its artwork when clicked', () => {
    const clicked = vi.fn();
    fixture.componentRef.instance.clicked.subscribe(clicked);

    root.querySelector('.card')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(clicked).toHaveBeenCalledWith(artwork);
  });

  it('is marked as a pen-cursor draw zone', () => {
    expect(root.hasAttribute('data-draw-zone')).toBe(true);
  });
});
