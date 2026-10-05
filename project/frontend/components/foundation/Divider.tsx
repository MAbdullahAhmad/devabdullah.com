import { cn } from '@/lib/cn';

interface DividerProps {
  /** Optional mono label centred on the line. */
  label?: string;
  className?: string;
}

/**
 * A 1px structural divider, optionally with a mono label in the middle
 * (Section 7.2).
 */
export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return (
      <div
        role="separator"
        className={cn('h-px w-full bg-border', className)}
      />
    );
  }

  return (
    <div
      role="separator"
      aria-label={label}
      className={cn('flex items-center gap-4', className)}
    >
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-label text-text-subtle">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
