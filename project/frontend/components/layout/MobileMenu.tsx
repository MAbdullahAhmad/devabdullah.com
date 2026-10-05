'use client';

import { lazy, Suspense, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { cx } from '@/lib/cx';
import { iconButton } from '@/components/layout/icon-button';

const loadPanel = () => import('@/components/layout/MobileMenuPanel');

const MobileMenuPanel = lazy(() =>
  loadPanel().then((mod) => ({ default: mod.MobileMenuPanel })),
);

/**
 * The mobile menu's open button. The dialog itself (Radix, with its focus trap
 * and scroll lock) stays out of the first-load bundle (Section 12.1): it starts
 * loading when the button is hovered, focused or touched, and renders on the
 * first click.
 */
export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const preload = () => void loadPanel();

  return (
    <>
      <button
        ref={button}
        type="button"
        className={cx(iconButton, className)}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
      >
        <Menu size={20} strokeWidth={1.5} aria-hidden />
      </button>
      {requested && (
        <Suspense fallback={null}>
          <MobileMenuPanel
            open={open}
            onOpenChange={setOpen}
            returnFocus={button}
          />
        </Suspense>
      )}
    </>
  );
}
