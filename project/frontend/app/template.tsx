import type { ReactNode } from 'react';

/**
 * Re-mounts on every navigation, replaying the simple fade-in defined by the
 * `page-fade` class in `styles/globals.css` (Section 4.7). The fade is pure CSS
 * so content is never hidden without JavaScript, and the global
 * reduced-motion floor makes it instant when requested.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
