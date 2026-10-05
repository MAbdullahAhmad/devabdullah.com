import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

interface BrowserFrameProps {
  children: ReactNode;
  /** Address shown in the bar, e.g. `pos.example.app`. */
  url?: string;
  className?: string;
}

/**
 * The one consistent frame used for every project visual (Section 4.8, 7.2).
 * Token-only: `--surface` chrome, 1px borders, `--radius-m`.
 */
export function BrowserFrame({ children, url, className }: BrowserFrameProps) {
  return (
    <div
      className={cx(
        'overflow-hidden rounded-md border border-border bg-bg-elevated',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2 rounded-pill bg-border-strong" />
          <span className="size-2 rounded-pill bg-border-strong" />
          <span className="size-2 rounded-pill bg-border-strong" />
        </div>
        {url && (
          <span className="mx-auto truncate rounded-sm bg-bg px-3 py-0.5 font-mono text-[0.6875rem] text-text-subtle">
            {url}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
