'use client';

import { openCommandMenu } from '@/lib/command-menu';
import { cx } from '@/lib/cx';
import { useModifierKey } from '@/components/global/CommandMenuTrigger';

/** Inline "Press ⌘K" hint that also opens the menu when clicked. */
export function CommandMenuHint({ className }: { className?: string }) {
  const mod = useModifierKey();

  return (
    <button
      type="button"
      onClick={openCommandMenu}
      className={cx(
        'rounded-sm text-left transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      Press <kbd className="font-mono">{mod}K</kbd>
    </button>
  );
}
