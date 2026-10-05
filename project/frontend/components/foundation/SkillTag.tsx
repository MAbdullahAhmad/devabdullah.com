import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SkillTagProps {
  children: ReactNode;
  className?: string;
}

/**
 * Small tag on a `--surface` background with a 6px radius (Section 7.2).
 */
export function SkillTag({ children, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border border-border bg-surface px-2 py-1 text-label text-text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}
