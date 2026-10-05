import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps {
  children: ReactNode;
  /** `content` = 1280px page shell (default); `reading` = 720px prose width. */
  size?: 'content' | 'reading';
  className?: string;
}

/**
 * Centres content and applies the page side padding (Section 4.4). Nest inside
 * a `Section` for vertical rhythm.
 */
export function Container({
  children,
  size = 'content',
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-[var(--page-padding-x)]',
        size === 'reading' ? 'max-w-reading' : 'max-w-content',
        className,
      )}
    >
      {children}
    </div>
  );
}
