'use client';

import type { RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { profile } from '@/content/profile';
import { mobileNav } from '@/lib/nav';
import { Logo } from '@/components/foundation/Logo';
import { NavLink } from '@/components/layout/NavLink';
import { ThemeToggle } from '@/components/global/ThemeToggle';
import { iconButton } from '@/components/layout/icon-button';

/**
 * Full-screen mobile navigation (Section 5.2). Built on Radix Dialog for a
 * focus trap, scroll lock and Escape handling. Links close the menu on click,
 * so it also closes on route change. Loaded on demand by `MobileMenu`, which
 * owns the open button.
 */
export function MobileMenuPanel({
  open,
  onOpenChange,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The open button, which gets focus back when the menu closes. */
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const close = () => onOpenChange(false);

  const socials = [
    { label: 'LinkedIn', href: profile.contact.linkedin },
    { label: 'GitHub', href: profile.contact.github },
    { label: 'Email', href: `mailto:${profile.contact.email}` },
    ...(profile.contact.upwork
      ? [{ label: 'Upwork', href: profile.contact.upwork }]
      : []),
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col bg-bg px-[var(--page-padding-x)] py-6"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>

          <div className="flex items-center justify-between">
            <Logo />
            <Dialog.Close className={iconButton} aria-label="Close menu">
              <X size={20} strokeWidth={1.5} aria-hidden />
            </Dialog.Close>
          </div>

          <nav className="mt-12 flex flex-col gap-6">
            {mobileNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                onNavigate={close}
                className="text-display-m"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-6">
            <ThemeToggle />
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body-s text-text-muted">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="transition-colors hover:text-text"
                    target={
                      social.href.startsWith('http') ? '_blank' : undefined
                    }
                    rel={
                      social.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
