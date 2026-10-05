'use client';

import { usePathname } from 'next/navigation';

/**
 * The 404's SQL panel (Section 6.8), with the missing URL filled in from the
 * client (not-found receives no props). Tokens are coloured by hand in the
 * same one-accent scheme as the Shiki theme.
 */
export function MissingQuery() {
  const pathname = usePathname() ?? '/';

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-pill bg-border-strong" aria-hidden />
        <span className="size-2.5 rounded-pill bg-border-strong" aria-hidden />
        <span className="size-2.5 rounded-pill bg-border-strong" aria-hidden />
        <span className="ml-2 font-mono text-label text-text-subtle">
          query.sql
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-5 font-mono text-code text-text-muted">
        <code>
          <span className="text-accent-text">SELECT</span> *{' '}
          <span className="text-accent-text">FROM</span> pages{' '}
          <span className="text-accent-text">WHERE</span> slug ={' '}
          <span className="break-all text-text">&apos;{pathname}&apos;</span>;
          {'\n'}
          <span className="text-text-subtle">-- Empty set (0.00 sec)</span>
        </code>
      </pre>
    </div>
  );
}
