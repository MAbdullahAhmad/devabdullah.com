import Link from 'next/link';
import { contactNav, mainNav } from '@/lib/nav';
import { Logo } from '@/components/foundation/Logo';
import { Button } from '@/components/foundation/Button';
import { HeaderShell } from '@/components/layout/HeaderShell';
import { NavLink } from '@/components/layout/NavLink';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { ThemeToggle } from '@/components/global/ThemeToggle';
import { CommandMenuTrigger } from '@/components/global/CommandMenuTrigger';

/**
 * Site header (owner change OC.2): a full-width glass bar at the top of the
 * page that settles into a floating glass pill once scrolled (`HeaderShell`).
 * Logo left, links and actions right. A server component, so the logo, button
 * and layout ship as HTML only.
 */
export function SiteHeader() {
  return (
    <HeaderShell>
      <Link
        href="/"
        aria-label="devabdullah — home"
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Logo variant="full" className="hidden sm:inline-flex" />
        <Logo variant="icon" className="sm:hidden" />
      </Link>

      <nav
        className="ml-auto hidden items-center gap-7 text-body-s lg:flex"
        aria-label="Primary"
      >
        {mainNav.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2 lg:ml-4">
        <CommandMenuTrigger />
        <span className="hidden lg:inline-flex">
          <ThemeToggle />
        </span>
        <span className="hidden sm:inline-flex">
          <Button href={contactNav.href} variant="primary" size="sm">
            {contactNav.label}
          </Button>
        </span>
        <MobileMenu className="lg:hidden" />
      </div>
    </HeaderShell>
  );
}
