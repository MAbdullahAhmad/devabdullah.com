import { cn } from '@/lib/cn';
import { MARK_PATHS, MARK_VIEWBOX } from '@/lib/brand-mark';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export function Logo({ variant = 'full', className }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2.5 text-text', className)}
      aria-label="Abdullah Ahmad"
      role="img"
    >
      <svg
        viewBox={MARK_VIEWBOX}
        className="h-[1.6rem] w-auto shrink-0"
        aria-hidden
        focusable="false"
      >
        {MARK_PATHS.ink.map((d) => (
          <path key={d} d={d} fill="currentColor" />
        ))}
        <path d={MARK_PATHS.accent} fill="var(--accent)" />
      </svg>
      {variant === 'full' && (
        <span
          className="text-[1.1875rem] font-bold leading-none tracking-[-0.035em]"
          aria-hidden
        >
          dev<span className="text-accent">abdullah</span>
        </span>
      )}
    </span>
  );
}
