import { cn } from '@/lib/cn';

const TECH = [
  'Laravel',
  'PHP',
  'React',
  'Vue.js',
  'Node.js',
  'Livewire',
  'Tailwind CSS',
  'MySQL',
  'PostgreSQL',
  'Redis',
  'Docker',
  'Git',
];

function Row({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 px-5 font-mono text-label text-text-subtle"
      aria-hidden={ariaHidden || undefined}
    >
      {TECH.map((tech) => (
        <li key={tech} className="flex items-center gap-10 whitespace-nowrap">
          <span>{tech}</span>
          <span className="size-1 rounded-pill bg-border-strong" aria-hidden />
        </li>
      ))}
    </ul>
  );
}

/**
 * Slow marquee of the technologies actually used (Section 6.1). Pure CSS —
 * pauses on hover and stops with reduced motion. Both edges fade out with a
 * mask. The list is duplicated so the loop is seamless.
 */
export function TechMarquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
