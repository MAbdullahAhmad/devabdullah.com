import type { CSSProperties, ReactNode } from 'react';

export type RevealVariant = 'up' | 'fade' | 'scale' | 'left' | 'clip';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in seconds, for staggering sibling reveals (Section 4.7: 60ms). */
  delay?: number;
  /** How it enters: rise (default), fade, scale up, slide from the left, or
   * a top-to-bottom clip wipe (for images and diagrams). */
  variant?: RevealVariant;
}

/**
 * The standard scroll reveal (Section 4.7). A server component: it only marks
 * the element with `data-reveal`; the one shared observer in `MotionRoot`
 * adds `data-revealed` when it scrolls into view, and CSS ("Motion system" in
 * `styles/globals.css`) runs the transition. Content is only hidden once the
 * pre-paint `data-js` flag is set, so it stays visible without JavaScript;
 * reduced motion and print show it immediately.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = 'up',
}: RevealProps) {
  return (
    <div
      data-reveal={variant}
      className={className}
      style={
        delay ? ({ '--reveal-delay': `${delay}s` } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}
