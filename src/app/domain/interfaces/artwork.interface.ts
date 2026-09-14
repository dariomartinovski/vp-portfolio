export interface Artwork {
  id: string;
  title: string;
  category: 'illustration' | 'branding' | 'ui' | 'print';
  description: string;
  tags: string[];
  src: string;
  thumbnail: string;
  featured: boolean;
  /** Omitted for pieces whose creation date isn't recorded. */
  year?: number;
}
