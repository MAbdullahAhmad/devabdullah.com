'use client';

import { useSyncExternalStore } from 'react';
import { Search } from 'lucide-react';
import { openCommandMenu } from '@/lib/command-menu';
import { cx } from '@/lib/cx';

const noop = () => () => {};

/** "⌘" on Apple platforms, "Ctrl" elsewhere (server renders "⌘"). */
export function useModifierKey() {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl '),
    () => '⌘',
  );
}

/** Header button that opens the command menu (Section 6.1 header, 8.4). */
export function CommandMenuTrigger({ className }: { className?: string }) {
  const mod = useModifierKey();

  return (
    <button
      type="button"
      onClick={openCommandMenu}
      aria-label="Open command menu"
      aria-keyshortcuts="Meta+K Control+K"
      className={cx(
        'inline-flex h-9 items-center gap-2 rounded-pill border border-border bg-bg-elevated px-3 text-text-muted transition-colors ease-out [transition-duration:var(--dur-base)] hover:border-border-strong hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <Search size={16} strokeWidth={1.5} aria-hidden />
      <kbd className="hidden font-mono text-label sm:inline">{mod}K</kbd>
    </button>
  );
}
