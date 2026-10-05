import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  label?: string;
  className?: string;
}

/**
 * Availability badge with a pulsing success dot. The pulse is the only allowed
 * status animation and stops for reduced motion (`motion-safe`), leaving a
 * static dot (Section 7.2).
 */
export function StatusBadge({
  label = 'Available',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-label text-text-muted',
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full rounded-pill bg-success opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2 rounded-pill bg-success" />
      </span>
      {label}
    </span>
  );
}
