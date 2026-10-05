import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Semantic section with the standard vertical padding (Section 4.4). Place a
 * `Container` inside to constrain width.
 */
export function Section({ children, id, className, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('py-[var(--section-padding-y)]', className)}
      {...rest}
    >
      {children}
    </section>
  );
}
