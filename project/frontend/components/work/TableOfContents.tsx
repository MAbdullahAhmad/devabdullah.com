'use client';

import { useEffect, useState } from 'react';
import type { CaseStudyHeading } from '@/lib/case-studies';
import { cn } from '@/lib/cn';

/**
 * Sticky section navigation for a case study (Section 6.3). Headings come from
 * the server (no layout jump); the section currently being read is tracked
 * with an IntersectionObserver and marked with the accent.
 */
export function TableOfContents({
  headings,
}: {
  headings: CaseStudyHeading[];
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <span className="font-mono text-label text-text-subtle">
        On this page
      </span>
      <ol className="flex flex-col border-l border-border">
        {headings.map((heading) => {
          const isActive = heading.id === active;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  '-ml-px block border-l py-1.5 pl-4 text-body-s transition-colors ease-out [transition-duration:var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  isActive
                    ? 'border-accent text-text'
                    : 'border-transparent text-text-muted hover:text-text',
                )}
              >
                {heading.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
