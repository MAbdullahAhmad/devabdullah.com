import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CaseStudyMeta } from '@/lib/case-studies';

/**
 * Large, full-width link onward (Section 6.3). Points at the next case study;
 * while there is only one, it leads back to the full work index instead.
 */
export function NextProject({ next }: { next: CaseStudyMeta | null }) {
  const href = next ? `/work/${next.slug}` : '/work';
  const label = next ? 'Next project' : 'All work';
  const title = next ? next.title : 'See every project';

  return (
    <Link
      href={href}
      data-reveal="up"
      className="group flex items-end justify-between gap-6 border-t border-border py-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <span className="flex flex-col gap-3">
        <span className="font-mono text-label text-text-subtle">{label}</span>
        <span className="text-balance text-display-m text-text transition-colors ease-out [transition-duration:var(--dur-base)] group-hover:text-accent-text">
          {title}
        </span>
      </span>
      <ArrowRight
        size={40}
        strokeWidth={1.25}
        aria-hidden
        className="mb-2 shrink-0 text-text-muted transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:translate-x-2 group-hover:text-accent-text"
      />
    </Link>
  );
}
