import { NavItem } from '../interfaces/nav-item.interface';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', anchor: '#home' },
  { label: 'Work', anchor: '#featured' },
  { label: 'About', anchor: '#about' },
  { label: 'Services', anchor: '#services' },
  { label: 'Contact', anchor: '#contact' },
];

export const NAV_WORK_LINK: NavItem = {
  label: 'All Work',
  route: '/work',
};
