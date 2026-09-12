export interface TechBadge {
  name: string;
  icon: string; // path to icon in assets or a lucide name
}

export const TECHNOLOGIES: TechBadge[] = [
  { name: 'Adobe Illustrator', icon: 'assets/images/icons/illustrator.svg' },
  { name: 'Adobe Photoshop', icon: 'assets/images/icons/photoshop.svg' },
  { name: 'Figma', icon: 'assets/images/icons/figma.svg' },
  { name: 'Procreate', icon: 'assets/images/icons/procreate.svg' },
];
