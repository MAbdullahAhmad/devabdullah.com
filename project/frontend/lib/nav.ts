export interface NavItem {
  label: string;
  href: string;
}

/** Centre links in the desktop header (Blueprint Section 5.2). */
export const mainNav: NavItem[] = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'My Mac', href: '/my-mac' },
  { label: 'Contact', href: '/contact' },
];

/** Primary call to action, shown as a pill button. */
export const contactNav: NavItem = {
  label: 'Book a call',
  href: '/book-a-call',
};

/** Full page list shown in the mobile menu. */
export const mobileNav: NavItem[] = [
  { label: 'Home', href: '/' },
  ...mainNav,
  { label: 'CV', href: '/cv' },
  contactNav,
];
