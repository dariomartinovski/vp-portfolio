export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
  { label: 'Behance', url: 'https://behance.net/', icon: 'globe' },
  { label: 'Email', url: 'mailto:hello@example.com', icon: 'mail' },
];
