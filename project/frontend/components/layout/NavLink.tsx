'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/cx';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Called on click — used to close the mobile menu. */
  onNavigate?: () => void;
}

/**
 * A navigation link that marks the active page with `--text` colour and a
 * small accent dot; inactive links use `--text-muted` (Section 5.2).
 */
export function NavLink({
  href,
  children,
  className,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const active =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch={href === '/my-mac' ? false : undefined}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'nav-link inline-flex items-center gap-1.5 font-medium transition-colors ease-out [transition-duration:var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        active ? 'text-text' : 'text-text-muted hover:text-text',
        className,
      )}
    >
      {children}
      <span
        className={cx(
          'size-1.5 rounded-pill bg-accent transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      />
    </Link>
  );
}
