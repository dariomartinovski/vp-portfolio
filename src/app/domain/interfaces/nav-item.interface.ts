export interface NavItem {
  label: string;
  anchor?: string; // e.g. '#featured' - for same-page scroll
  route?: string; // e.g. '/work' - for router navigation
  isExternal?: boolean;
}
